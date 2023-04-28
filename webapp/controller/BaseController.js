sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("CusOrdCustomer_Order.controller.BaseController", {

	getRouter: function() {
		return this.getOwnerComponent().getRouter();
	},
	getModel: function(n) {
		return this.getView().getModel(n) || this.getOwnerComponent().getModel(n);
	},
	setModel: function(oModel, sModelName) {
		return this.getView().setModel(oModel, sModelName);
	},
	getResourceBundle: function() {
		return this.getOwnerComponent().getModel("i18n").getResourceBundle();
	},
	getDataManager: function() {
		return this.getOwnerComponent().getDataManager();
	},
	getBarcodeScanHandler: function() {
		return this.getOwnerComponent().getBarcodeScanHandler();
	}
	
	});
});