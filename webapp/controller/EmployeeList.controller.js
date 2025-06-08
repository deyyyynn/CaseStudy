sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "./formatter",
    "sap/m/MessageToast"
], (Controller,
    JSONModel,
	Filter,
	FilterOperator,
    formatter) => {
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
                    MessageToast.show("Error fetching employee count.");
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
                // Likely age (e.g., "25")
                let iAge = parseInt(sQuery, 10);
                if (iAge >= 18 && iAge <= 70) {
                    aFilters.push(new Filter("Age", FilterOperator.EQ, iAge));
                }
            } else if (sQuery.length === 8 && !isNaN(Number(sQuery))) {
                // Likely a date in MMDDYYYY, DDMMYYYY, or YYYYMMDD format
                let sDate = formatter.toModelDateFormat(sQuery);
                if (sDate) {
                    aFilters.push(new Filter("DateHire", FilterOperator.Contains, sDate));
                }
            } else if (sQuery.toUpperCase().startsWith("CL") && sQuery.length <= 4) {
                // Likely CareerLevel (e.g., CL5, CL10)
                aFilters.push(new Filter("CareerLevel", FilterOperator.EQ, sQuery.toUpperCase()));
            } else if (sQuery.startsWith("EmployeeID")) {
                // EmployeeID
                aFilters.push(new Filter("EmployeeID", FilterOperator.EQ, sQuery));
            } else {
                // Fallback to name/project filters
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
        }
    });
});