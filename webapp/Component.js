sap.ui.define([
    "sap/ui/core/UIComponent",
    "sapips/training/employeeapp/model/models",
], (UIComponent, models, ) => {
    "use strict";

    return UIComponent.extend("sapips.training.employeeapp.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createDeviceModel(), "device");

            // Load employee model
            var oEmployeeModel = new sap.ui.model.json.JSONModel();
            oEmployeeModel.loadData("model/employee.json");
            this.setModel(oEmployeeModel, "employee");

            // Load skill model
            var oSkillModel = new sap.ui.model.json.JSONModel();
            oSkillModel.loadData("model/skill.json");
            this.setModel(oSkillModel, "skill");

            this.getRouter().initialize();

        }
    });
});