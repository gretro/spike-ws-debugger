import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';

const appNode = document.querySelector('#root');
console.log('React-DOM', ReactDOM);

if (appNode) {
  ReactDOM.render(
    <App />
  , appNode);
} else {
  document.write('Unable to find root Node');
}
