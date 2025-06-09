sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "./formatter",
    "sap/m/MessageBox"
], (Controller,
    JSONModel,
	Filter,
	FilterOperator,
    formatter,
    MessageBox) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EmployeeList", {
        formatter: formatter,
        onInit() {
            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteEmployeeList").attachPatternMatched(this._onRouteMatched, this);
           
        },
        _fetchEmployeeCount: function () {
            let oModel = this.getOwnerComponent().getModel();

            oModel.refresh(true);

            oModel.read("/EMPLOYEE/$count", {
                success: function (oData) {

                    let oCountModel = new JSONModel({ employeeCount: oData });
                    this.getView().setModel(oCountModel, "employeeCountModel");
                }.bind(this),
                error: function () {
                    let errFetch = this.getView().getModel("i18n").getResourceBundle().getText("errFetch");
                    MessageBox.error(errFetch);
                }
            });
        },
        _onRouteMatched: function(){
            this._fetchEmployeeCount();
        },
        onClickAdd: function (){
            this.getOwnerComponent().getRouter().navTo("RouteCreatePage");
        },
        
        onSearch: function (oEvent) {
            let sQuery = oEvent.getSource().getValue();
            let oTable = this.byId("employeeTable");
            let oBinding = oTable.getBinding("items");
            
            if (!sQuery) {
                if (oBinding) {
                    oBinding.filter([]); 
                }
                return;
            }

            let aFilters = [];
          
            
            let sCapitalizedQuery = sQuery.charAt(0).toUpperCase() + sQuery.slice(1).toLowerCase();

            if (!isNaN(Number(sQuery)) && sQuery.length === 2) {
                let iAge = parseInt(sQuery, 10);
                if (iAge >= 0 && iAge <= 90) {
                    aFilters.push(new Filter("Age", FilterOperator.EQ, iAge));
                }
            } else if (sQuery.length === 8 && !isNaN(Number(sQuery))) {

                let sDate = formatter.toModelDateFormat(sQuery);
                if (sDate) {
                    aFilters.push(new Filter("DateHire", FilterOperator.Contains, sDate));
                }
            } else if (sQuery.toUpperCase().startsWith("CL") && sQuery.length <= 4) {
                
                aFilters.push(new Filter("CareerLevel", FilterOperator.EQ, sQuery.toUpperCase()));
            } else if (sQuery.startsWith("EmployeeID")) {
                
                aFilters.push(new Filter("EmployeeID", FilterOperator.EQ, sQuery));
            } else {
                
                aFilters.push(new Filter("FirstName", FilterOperator.Contains, sCapitalizedQuery));
                aFilters.push(new Filter("LastName", FilterOperator.Contains, sCapitalizedQuery));
                aFilters.push(new Filter("CurrentProject", FilterOperator.Contains, sCapitalizedQuery));
            }
            

            if (oBinding) {
                oBinding.filter(new Filter({
                    filters: aFilters,
                    and: false 
                }));
            }
        },

        onDelete: function(){
            
            let oTable = this.byId("employeeTable");
            let aSelectedItems = oTable.getSelectedItems();
            let oerrDel = this.getView().getModel("i18n").getResourceBundle();
            if (aSelectedItems.length === 0) {
                MessageBox.warning(oerrDel.getText("delWarn"));
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected employee/s?", {
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        let oModel = this.getOwnerComponent().getModel();
                        let iPending = aSelectedItems.length;
                        let bErrorOccurred = false;
                        
                        aSelectedItems.forEach(function (oItem) {
                            let sPath = oItem.getBindingContext().getPath();

                            oModel.remove(sPath, {
                                success: function () {
                                    iPending--;
                                    if (iPending === 0 && !bErrorOccurred) {
                                        MessageBox.success("{i18n>delsuc}");
                                    }
                                },
                                error: function () {
                                    bErrorOccurred = true;
                                    MessageBox.error("{i18n>delFail}");
                                }
                            });
                        });

                        oTable.removeSelections();
                    }
                }.bind(this)
            });
        },

        onEmployeePress: function(oEvent) {
            let sEmployeeID = oEvent.getSource().getBindingContext().getProperty("EmployeeID");
            this.getOwnerComponent().getRouter().navTo("RouteViewPage", {
                EmployeeID: sEmployeeID
            });
        }
    });
});