import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import ItemCount from '../ItemCount/ItemCount'

const Item = (props) => {
    const [shopped, setShopped] = useState(0);
    useEffect(() => {
        let inCart = 0;
        props.cart.filter(i => i.item === props.item.id).map(i => inCart = inCart+i.qty);
        setShopped(inCart);
    }, [setShopped, props.cart, props.item.id]);
    return (
        <div className="col col-md-6 col-lg-3 p-2">
            <div className="w-100 border bg-light py-3 rounded justify-content-center">
                <div className="row">
                    <h5 style={{height: "3em"}}>{props.item.name}</h5>
                </div>
                <div className="row">
                    <div className="col">
                        <img src={"../Images/Products/" + props.item.img} alt={props.item.img} className="w-50 mb-1 rounded-circle" />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <span className="text-success">${props.item.price.toFixed(2)} por unidad</span>
                    </div>
                </div>
                {shopped === 0 ?
                <div className="row">
                    <div className="col">
                        {typeof(props.item?.id) !== 'undefined' && <ItemCount item={props.item?.id} stock={props.item?.stock} initial={props.item?.initial} onAdd={props.onAdd} cart={props.cart} />}
                    </div>
                </div>
                :
                <div>
                    <div className="row">
                        <div className="text-secondary"><small >{shopped} en el carro de {props.item?.stock} disponibles</small></div>
                    </div>
                    <div className="row my-2">
                        <div className="col px-4">
                            <Link to="/cart" className="btn btn-outline-secondary w-100">Finalizar compra</Link>
                        </div>
                    </div>
                </div>
                }
                {/*<ItemCount item={props.item.id} stock={props.item.stock} initial={props.item.initial} onAdd={props.onAdd} cart={props.cart} />*/}
                <div className="row my-2">
                    <div className="col px-4">
                        <Link to={'/item/'+props.item.id} className="btn btn-outline-primary w-100" >Detalles</Link>
                        {/*<button className="btn btn-outline-primary w-100" onClick={() => (props.setItemDetail(props.item.id))}>Detalles</button>*/}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Item
