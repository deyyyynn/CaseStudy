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
        showMessageBox: function (sType, sKey, aParams = []) {
            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            const sMessage = oResourceBundle.getText(sKey, aParams);
        
            switch (sType) {
                case "success":
                    MessageBox.success(sMessage);
                    break;
                case "error":
                    MessageBox.error(sMessage);
                    break;
                case "warning":
                    MessageBox.warning(sMessage);
                    break;
                case "information":
                    MessageBox.information(sMessage);
                    break;
                case "confirm":
                    MessageBox.confirm(sMessage);
                    break;
                default:
                    MessageBox.show(sMessage);
            }
        },
        _fetchEmployeeCount: function () {
            let oModel = this.getOwnerComponent().getModel();

            oModel.refresh(true);
            // Read the total count from the /EMPLOYEE endpoint using $count
            oModel.read("/EMPLOYEE/$count", {
                success: function (oData) {
                    // Set the total count of employees in the model
                    let oCountModel = new JSONModel({ employeeCount: oData });
                    this.getView().setModel(oCountModel, "employeeCountModel");
                }.bind(this),
                error: function () {
                    this.showMessageBox("error", "msg_fetchError");
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
                    oBinding.filter([]); // Clear filters = show all data
                }
                return;
            }

            let aFilters = [];
          
            // Capitalized query (used for fields like CurrentProject)
            let sCapitalizedQuery = sQuery.charAt(0).toUpperCase() + sQuery.slice(1).toLowerCase();

             // FILTERS----------------------------------------------------------------------------
            if (!isNaN(Number(sQuery)) && sQuery.length === 2) {
                // Age
                let iAge = parseInt(sQuery, 10);
                if (iAge >= 0 && iAge <= 90) {
                    aFilters.push(new Filter("Age", FilterOperator.EQ, iAge));
                }
            } else if (sQuery.length === 8 && !isNaN(Number(sQuery))) {
                // Date
                let sDate = formatter.toModelDateFormat(sQuery);
                if (sDate) {
                    aFilters.push(new Filter("DateHire", FilterOperator.Contains, sDate));
                }
            } else if (sQuery.toUpperCase().startsWith("CL") && sQuery.length <= 4) {
                // Career level
                aFilters.push(new Filter("CareerLevel", FilterOperator.EQ, sQuery.toUpperCase()));
            } else if (sQuery.startsWith("EmployeeID")) {
                // EmployeeID
                aFilters.push(new Filter("EmployeeID", FilterOperator.EQ, sQuery));
            } else {
                // Name and Project
                aFilters.push(new Filter("FirstName", FilterOperator.Contains, sCapitalizedQuery));
                aFilters.push(new Filter("LastName", FilterOperator.Contains, sCapitalizedQuery));
                aFilters.push(new Filter("CurrentProject", FilterOperator.Contains, sCapitalizedQuery));
            }
            // FILTERS----------------------------------------------------------------------------


            if (oBinding) {
                oBinding.filter(new Filter({
                    filters: aFilters,
                    and: false // OR logic — match if any field contains the query
                }));
            }
        },
        //Delete
        onDelete: function(){
            
            let oTable = this.byId("employeeTable");
            let aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                this.showMessageBox("warning", "msg_noSelection");
                return;
            }

            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            const sConfirmText = oResourceBundle.getText("msg_confirmDelete");

            MessageBox.confirm(sConfirmText, {
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
                                        this.showMessageBox("success", "msg_deleteEmp");
                                    }
                                },
                                error: function () {
                                    bErrorOccurred = true;
                                    this.showMessageBox("error", "msg_deleteError");
                                }
                            });
                        });

                        oTable.removeSelections();
                    }
                }.bind(this)
            });
        },

        //Nav to Employee View Page
        onEmployeePress: function(oEvent) {
            let sEmployeeID = oEvent.getSource().getBindingContext().getProperty("EmployeeID");
            this.getOwnerComponent().getRouter().navTo("RouteViewPage", {
                EmployeeID: sEmployeeID
            });
        }
    });
});