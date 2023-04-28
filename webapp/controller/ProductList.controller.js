sap.ui.define([
	"CusOrdCustomer_Order/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"CusOrdCustomer_Order/model/formatter",
	"sap/ui/core/Fragment",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	'sap/ui/model/FilterOperator'
], function(BaseController, JSONModel, formatter, Fragment, Sorter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("CusOrdCustomer_Order.controller.ProductList", {

		formatter: formatter,
		onInit: function() {
			var viewSettingModel = new JSONModel({
				"hidePrice": true,
				"sortOrder": false
			});
			this.setModel(viewSettingModel, "viewModel");
			this.cartModel = new JSONModel([]);
		},

		//	onBeforeRendering: function() {
		//
		//	},
		onFilter: function() {
			const filters = [];
			const productFilter = new Filter({
				path: "Material",
    			operator: FilterOperator.Contains,
    			value1: 'BTP',
   
			});
			filters.push(productFilter);
			this.getView().byId("tableProductList").getBinding("items").filter(filters);
			
			
		},
		onSort: function() {
			const sortOrder = this.getModel("viewModel").getProperty("/sortOrder");
			const sorter = new Sorter("Material", sortOrder);
			this.getView().byId("tableProductList").getBinding("items").sort(sorter);
		
			this.getModel("viewModel").setProperty("/sortOrder", !sortOrder);
		},

		onAfterRendering: function() {
			// this.getView().setModel(oModel, sModelName);  In case we use Controller instead of BaseController
			const tableProduct = this.getView().byId("tableProductList");
			const selectedItem = tableProduct.getSelectedItem();
			tableProduct.getBindingContext();
			tableProduct.setBusyIndicatorDelay(0);
			tableProduct.setBusy(true);
			const oDefaultSorters = [];
			const oDefaultFilters = [];
			// const oDefaultFilter = 
			this.getModel().read("/ProductSet", {
				sorter: oDefaultSorters,
				filters: oDefaultFilters,
				success: function(d,r) {
					this.setModel(new JSONModel(d.results),"product");
					tableProduct.setBusy(false);
				}.bind(this),
				error: function(e) {
					tableProduct.setBusy(false);
				}.bind(this)
			});
			// tableProduct.bindAggregation("items", {
			// 	path:'/ProductSet'
			// });
		},
		onCartPress: function() {
			//Open Cart Dialog
			var that = this;

			if (!this.CartDialog) {
				Fragment.load({
					name: "CusOrdCustomer_Order.view.fragment.CartDialog",
					type: "XML",
					controller: this
				}).then(function(fragment) {
					that.CartDialog = fragment;
					that.getView().addDependent(fragment);
					that.setModel(that.cartModel, "cart");
					fragment.open();
				});
			} else {
				this.CartDialog.open();
			}

		},
		onProductPress: function(oEvent) {
			const oSource = oEvent.getSource();
			
			const sProductID = oSource.getText();
			
			this.getRouter().navTo("ProductDetail", {
				"ProductNo": sProductID
			});
		},
		onCartDialogClose: function() {
			if (this.CartDialog) {
				this.CartDialog.close();
			}
		},
		onCheckoutPress: function() {
			//get OdataModel instance
			var oODataModel = this.getModel();

			//Set Deferred group
			// oODataModel.setDeferredGroups(["cart"]);

			//get Cart Data
			var oCartData = this.cartModel.getProperty("/");

			//create "Create" request 
			// for (var i = 0; i < oCartData.length; i++) {
			// 		let order = {};
			// order.OrderItem = oCartData[i].Material;
			// order.Quantity = oCartData[i].OrderQuantity;
			// order.Amount =  oCartData[i].Price *  oCartData[i].OrderQuantity;
			// order.Currency =  oCartData[i].Currency;
			// }

			// oCartData.forEach(function(element) {

			// 	let order = {};
			// 	order.OrderItem = element.Material;
			// 	order.Quantity = element.OrderQuantity;
			// 	order.Amount = "" +  element.Price * element.OrderQuantity;
			// 	order.Currency = element.Currency;

			// 	this.getModel().create("/SalesOrderSet", order, {
			// 		groupId: "cart"
			// 	});
			// }.bind(this));

			// this.CartDialog.setBusy(true);
			// var onSuccess = function(data, response) {
			// 		//
			// 		this.CartDialog.setBusy(false);
			// 	},
			// 	onError = function(error) {
			// 		//
			// 		this.CartDialog.setBusy(false);
			// 	};

			// this.getModel().submitChanges({
			// 	groupId: "cart",
			// 	success: onSuccess.bind(this),
			// 	error: onError.bind(this)
			// })
			var order = {
				OrderDate: new Date(),
				POReference: '',
				OrderItem: []
			};
			oCartData.forEach(function(element) {
				order.OrderItem.push({
					Material: element.Material,
					Quantity: element.OrderQuantity,
					Amount: "" + element.Price * element.OrderQuantity,
					Currency: element.Currency
				});

			});
			var onSuccess = function(data, response) {
					//
					this.CartDialog.setBusy(false);
				},
				onError = function(error) {
					//
					this.CartDialog.setBusy(false);
				};

			this.CartDialog.setBusy(true);
			this.getModel().create("/SalesOrderSet", order, {
				success: onSuccess,
				error: onError
			});
			// this.getModel().submitChanges({
			// 	groupId: "cart",
			// 	success: onSuccess.bind(this),
			// 	error: onError.bind(this)
			// })
		},
		onOrderQtyChange: function(oEvent) {
			//Validate against In Stock value
			// Step 1: Get the selected entry:
			var sNewOrderValue = oEvent.getParameter("value");
			var oSelectedItemObj = oEvent.getSource().getParent().getItems()[0].getBindingContext().getObject(); // Get JSON Object
			//Step 2: validate
			if (sNewOrderValue > oSelectedItemObj.inStock) {
				//Pop up Error Message
				window.alert("Out of stock");
				oEvent.getSource().setValue("0");
				return;
			}
			//Update to Cart
			var oCart = this.cartModel.getProperty("/");

			oCart.push({
				Material: oSelectedItemObj.Material,
				Description: oSelectedItemObj.Description,
				OrderQuantity: sNewOrderValue,
				Price: oSelectedItemObj.Price,
				Currency: oSelectedItemObj.Currency
			});
			this.cartModel.updateBindings();
		},
		onLessQty: function(oEvent) {
			var tableProductList = this.getView().byId("tableProductList");
			var selectedItem = tableProductList.getSelectedItem();
			if (selectedItem) {
				var oSelectedItemObj = selectedItem.getBindingContext().getObject();
				// validate against In Stock
				if (--oSelectedItemObj.orderQty > oSelectedItemObj.inStock) {
					//Pop up Error Message
					window.alert("Out of stock");
					oEvent.getSource().setValue("0");
					return;
				}
				//Update Order Quantity - update to Cart Model

			}
		},
		onAddQty: function(oEvent) {

		}

		//	onExit: function() {
		//
		//	}

	});

});