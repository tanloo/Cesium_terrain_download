import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './tooltip.css'
import './main.css'
import Viewer from "./CMap";
import {Provider} from 'react-redux';
import { createStore } from 'redux'
import reducer from './reducers';
ReactDOM.render(
    <Provider store={createStore(reducer)}>
        <Viewer/>
    </Provider>
    ,
    document.getElementById('root'));
