import React, {useState, useContext} from 'react'
import CartContext from '../../Context/CartContext'
import { useEffect } from 'react/cjs/react.development'
import { getDoc, doc, addDoc, collection, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '../../Services/Firebase/Firebase'
import { Link } from 'react-router-dom';
import CartItem from '../CartItem/CartItem'
import OrderForm from '../OrderForm/OrderForm'
import LoadingItemList from '../ItemList/LoadingItemList'

const Cart = () => {
    const { cart, onRemove, onModify, cartTotal, clearCart } = useContext(CartContext);
    const [listProduct, setListProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [contact,  setContact] = useState({
        name:'',
        phone:'',
        email:'',
        status: false
    })
    const [processingOrder, setProcessingOrder] = useState(false)
    const [idLastOrder, setIdLastOrder] = useState(false)
    const [componentMounted, setComponentMounted] = useState();
    const confirmOrder = () => {
        setProcessingOrder(true)

        const objOrder = {
            items: cart,
            total: cartTotal(),
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            date: Timestamp.fromDate(new Date())
        }

        const batch = writeBatch(db)
        const batchUpdates = []
        const outOfStock = []
        var promises = [];
        
        objOrder.items.forEach((prod) => {
            promises.push(
                getDoc(doc(db, 'items', prod.item)).then((documentSnapshot) => {
                    if(documentSnapshot.data().stock >= prod.qty){
                        batchUpdates.push({ id: documentSnapshot.id, stock : documentSnapshot.data().stock - prod.qty })
                    } else {
                        outOfStock.push({ id: documentSnapshot.id, ...documentSnapshot.data() })
                    }
                })
            )
        })
        Promise.all(promises).then(() => {
            if( outOfStock.length === 0 ) {
                batchUpdates.forEach((p) => {
                    batch.update(doc(db, 'items', p.id), {
                        stock: p.stock
                    })
                })
                addDoc(collection(db, 'orders'), objOrder).then(({ id }) => {
                    batch.commit().then(() => {
                        if(componentMounted) {setIdLastOrder(id);setProcessingOrder(false)}
                    })
                }).catch((error) => {
                    console.log('Error ejecutando la orden ' + error)
                })
            } else {
                if(componentMounted) {setIdLastOrder('El stock ya no está disponible. Por favor vuelva a ejecutar su compra');setProcessingOrder(false)}
            }
            clearCart()
        });
    }

    useEffect(() => {
        setComponentMounted(true)
        return () => {
            setComponentMounted(false)
        };
    }, []);

    useEffect(() => {
        setLoading(true)
        setListProduct([])
        let Products = [];
        cart.forEach((el, idx, array)=> {
            getDoc(doc(db, 'items', el.item)).then((QuerySnapshot) => {
                const product = {id: QuerySnapshot.id, qty: el.qty, ...QuerySnapshot.data()}
                Products.push(product)
            }).catch((error) => {
                console.log('Error buscando el item', error)
            }).finally(() => {
                if (idx === array.length - 1){setListProduct(Products);setLoading(false);}
            })
        })
        cart.length === 0 && setLoading(false);
    }, [setLoading, cart])
    return (
        loading ? <LoadingItemList /> :
        <div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 justify-content-center py-2">
            {listProduct.length > 0 ?
                listProduct.map(i =><CartItem key={i.id} item={i} qty={i.qty} onRemove={onRemove} onModify={onModify} cart={cart} />)
                :
                <div className="my-4">Nada en la carta por el momento {idLastOrder !== false && <div><b>Id de su última órden: </b> {idLastOrder}</div>}</div>
            }
            </div>
            {listProduct.length > 0 ?
                <div>
                    <p className="h6 text-success">Total: ${cartTotal()}</p>
                    {showForm ? <OrderForm contact={ contact } setContact={ setContact } confirmOrder={ confirmOrder } /> :
                    <div className="btn-group pb-4" role="group" aria-label="Order buttons">
                        <div className="btn btn-outline-primary" onClick={() => { setShowForm(true) }}>Agregar contacto</div>
                        <div className="btn btn-outline-danger" onClick={() => { clearCart() }}>Cancelar compra</div>
                    </div> }
                </div>
                :
                <div className="row row-cols-3 justify-content-center my-1">
                    <div className="col px-4">
                        <Link to="/" className="btn btn-outline-secondary w-100">Busquemos lo que necesitas!</Link>
                    </div>
                </div>
            }
            {processingOrder && <div className="position-fixed bottom-0 start-0 p-2 m-2 rounded bg-dark text-light">Enviando orden...</div>}
        </div>
    )
}

export default Cart
