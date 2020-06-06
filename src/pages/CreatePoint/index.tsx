import React, { useEffect, useState, ChangeEvent, HtmlHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import {LeafletMouseEvent} from 'leaflet';

import './styles.css';
import logo from '../../assets/logo.svg';
import Axios from 'axios';


interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}


const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [uf, setUf] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedPosition, setSelecetedPosition] = useState<[number, number]>([0,0]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
  

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
           const {latitude, longitude} = position.coords;

           setInitialPosition([latitude, longitude ]);
        });
    });


    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        Axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados").then(response => {
            const ufSiglas = response.data.map(uf => uf.sigla);

            setUf(ufSiglas);

        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return
        }

        Axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {

                const cityNames = response.data.map(city => city.nome);
                setCities(cityNames);

            });
    }, [selectedUf]);

    function hundleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }


    function hundleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function hundleMapClick(event: LeafletMouseEvent){
        setSelecetedPosition([event.latlng.lat, event.latlng.lng]);
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
               </Link>
            </header>

            <form action="">
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={hundleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} zoom={15}  />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={hundleSelectedUf}>

                                <option value="0" selected disabled>Selecione uma UF</option>
                                {
                                    uf.map(ufs => {
                                        return (
                                            <option  value={ufs}>{ufs}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={hundleSelectedCity} value={selectedCity}>
                                <option value="0" selected disabled>Selecione uma Cidade</option>
                                {
                                    cities.map(city => {
                                        return (
                                            <option value={city}>{city}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de Coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li key={item.id}>
                                    <img src={item.image_url} alt="Oleo" />
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint;