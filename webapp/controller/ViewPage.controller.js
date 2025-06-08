sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, History, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.ViewPage", {
        onInit: function() {
            // Assuming you have route matched setup
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("employeeRouteName").attachPatternMatched(this._onRouteMatched, this);
        
            // Load skill model once here if not loaded already
            this._oSkillModel = this.getOwnerComponent().getModel("skill");
        },
        
        _onRouteMatched: function(oEvent) {
            var sEmpId = oEvent.getParameter("arguments").employeeId;  // or the route param name
        
            // Bind the employee details - find index of employee in employee model
            var oEmployeeModel = this.getOwnerComponent().getModel("employee");
            var aEmployees = oEmployeeModel.getProperty("/");
            var iIndex = aEmployees.findIndex(emp => emp.EmployeeID === sEmpId);
        
            if (iIndex === -1) {
                sap.m.MessageToast.show("Employee not found");
                return;
            }
        
            this.getView().bindElement({
                path: `/` + iIndex,
                model: "employee"
            });
        
            // Filter skills for the employee
            var aAllSkills = this._oSkillModel.getProperty("/");
            var aFilteredSkills = aAllSkills.filter(skill => skill.EmployeeId === sEmpId);
        
            // Create filtered skills JSONModel and set it to view
            var oFilteredSkillsModel = new sap.ui.model.json.JSONModel({ Skills: aFilteredSkills });
            this.getView().setModel(oFilteredSkillsModel, "filteredSkills");
        
            // Bind skills table items to filtered skills
            var oSkillsTable = this.byId("skillsTable");
            oSkillsTable.bindItems({
                path: "filteredSkills>/Skills",
                template: this.byId("columnListItem").clone()
            });
        }
    });
});
