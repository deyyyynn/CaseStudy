sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "./formatter",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox"
], (Controller, JSONModel, Filter, formatter, History, MessageBox) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.ViewPage", {
        formatter: formatter,

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteViewPage").attachPatternMatched(this._onObjectMatched, this);
        },

        onClickCancel: function () {
            let sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteEmployeeList", null, true);
            }
        },

        _onObjectMatched: function (oEvent) {
            let sEmployeeID = oEvent.getParameter("arguments").EmployeeID;
            let oModel = this.getOwnerComponent().getModel();

            // Load employee data
            oModel.read("/EMPLOYEE", {
                filters: [new Filter("EmployeeID", "EQ", sEmployeeID)],
                success: function (oData) {
                    let oEmployeeModel = new JSONModel(oData.results[0]);
                    this.getView().setModel(oEmployeeModel, "employeedetails");
                }.bind(this),
                error: function () {
                    MessageBox.error("Failed to load employee data.");
                }
            });

            // Load skills and count table items
            oModel.read("/SKILL", {
                filters: [new Filter("EmployeeID", "EQ", sEmployeeID)],
                success: function (oData) {
                    // Filter duplicates
                    let aUniqueSkills = oData.results.filter((item, index, self) =>
                        index === self.findIndex(t =>
                            t.SkillName === item.SkillName && t.ProficiencyID === item.ProficiencyID
                        )
                    );

                    // Set filtered skills model
                    let oSkillsModel = new JSONModel({ Skills: aUniqueSkills });
                    this.getView().setModel(oSkillsModel, "skills");

                    // Wait for table update to get row count
                    this.byId("skillsTable").attachEventOnce("updateFinished", () => {
                        let iCount = this.byId("skillsTable").getItems().length;
                        let oTableCountModel = new JSONModel({ skillsTableCount: iCount });
                        this.getView().setModel(oTableCountModel, "skillsTableCountModel");
                    });

                }.bind(this),
                error: function () {
                    MessageBox.error("Failed to load skills.");
                }
            });
        },
        onClickEdit: function () {
            var oModel = this.getView().getModel("employeedetails");

            if (!oModel) {
                MessageBox.error("Employee details model not available.");
                return;
            }

            var sEmployeeID = oModel.getProperty("/EmployeeID");

            if (sEmployeeID) {
                var oRouter = this.getOwnerComponent().getRouter();
                console.log("Navigating to EditPage for EmployeeID:", sEmployeeID);
                oRouter.navTo("RouteEditPage", {
                    EmployeeID: sEmployeeID
                });
            } else {
                MessageBox.warning("Employee ID not found in the model.");
            }
        }
    });
});
