sap.ui.define([
    "sap/ui/core/UIComponent",
    "sapips/training/employeeapp/model/models",
    "sapips/training/employeeapp/localService/mainService/mockserver"
], (UIComponent, models, mockserver) => {
    "use strict";

    return UIComponent.extend("sapips.training.employeeapp.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            
            this.initializeODataService();
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

        },
        initializeODataService: function(){
            mockserver.init();
            var oModel = new sap.ui.model.odata.v2.ODataModel({
                serviceUrl:'/sap/opu/odata/sap/EMPLOYEE_SRV'
            });
            this.setModel(oModel);
        }
    });
});