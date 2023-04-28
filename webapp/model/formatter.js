sap.ui.define([], function () {
    "use strict";
    return {
        stockStatus: function(sInStock) {
            let status = 'None';
            if ( sInStock > 100 ) { // if In Stock greater than 100, value state = Success
                status = 'Success';
            } else if (sInStock > 0) { // if 0 < In Stock <= 100, value state = Warning
                status = 'Warning';
            } else {
                status = 'Error'; // If In Stock = 0, value state = Error
            }
            return status;
        }
    }
});