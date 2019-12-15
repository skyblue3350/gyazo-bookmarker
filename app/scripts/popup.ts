import "semantic-ui-css/semantic.min.css";

import {changePage, deleteEvent, setupPager} from './utils'

setupPager()
changePage(parseInt(document.getElementById('page')!.dataset.page!))