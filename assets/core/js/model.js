import './main.js';
import '../css/model.less';
import { load } from './form/controller';

load(document.querySelector('[data-schema-url]'));
