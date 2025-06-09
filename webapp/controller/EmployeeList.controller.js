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
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteEmployeeList").attachPatternMatched(this._onRouteMatched, this);
        },
        _fetchEmployeeCount: function () {
            var oModel = this.getOwnerComponent().getModel();

            oModel.refresh(true);
            // Read the total count from the /EMPLOYEE endpoint using $count
            oModel.read("/EMPLOYEE/$count", {
                success: function (oData) {
                    // Set the total count of employees in the model
                    var oCountModel = new JSONModel({ employeeCount: oData });
                    this.getView().setModel(oCountModel, "employeeCountModel");
                }.bind(this),
                error: function () {
                    MessageBox.error("Error fetching employee count.");
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
            var sQuery = oEvent.getSource().getValue();
            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");
            
            if (!sQuery) {
                if (oBinding) {
                    oBinding.filter([]); // Clear filters = show all data
                }
                return;
            }

            var aFilters = [];
          
            // Capitalized query (used for fields like CurrentProject)
            var sCapitalizedQuery = sQuery.charAt(0).toUpperCase() + sQuery.slice(1).toLowerCase();

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
            
            var oTable = this.byId("employeeTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageBox.warning("Must select at least 1 employee.");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected employee/s?", {
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        var oModel = this.getOwnerComponent().getModel();
                        var iPending = aSelectedItems.length;
                        var bErrorOccurred = false;
                        
                        aSelectedItems.forEach(function (oItem) {
                            var sPath = oItem.getBindingContext().getPath();

                            oModel.remove(sPath, {
                                success: function () {
                                    iPending--;
                                    if (iPending === 0 && !bErrorOccurred) {
                                        MessageBox.success("Selected employee(s) deleted successfully.");
                                    }
                                },
                                error: function () {
                                    bErrorOccurred = true;
                                    MessageBox.error("Failed to delete one or more employees.");
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
            var sEmployeeID = oEvent.getSource().getBindingContext().getProperty("EmployeeID");
            this.getOwnerComponent().getRouter().navTo("RouteViewPage", {
                EmployeeID: sEmployeeID
            });
        }
    });
});