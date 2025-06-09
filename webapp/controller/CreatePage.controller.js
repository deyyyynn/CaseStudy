sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/m/library"
], (Controller, JSONModel, MessageBox, History, mobileLibrary) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.CreatePage", {
        onInit() {
            // Date of Hire Conditions
            var oDatePicker = this.byId("datePicker");
            var oToday = new Date();
            var oMaxDate = new Date();
            oMaxDate.setFullYear(oMaxDate.getFullYear() + 1); // +1 year from today
        
            // Set default value (today)
            oDatePicker.setDateValue(oToday);
        
            // Set min and max dates
            oDatePicker.setMinDate(oToday);
            oDatePicker.setMaxDate(oMaxDate);

            var oModel = new sap.ui.model.json.JSONModel({
                selectedDate: oToday
            });
            
            var oSkillModel = new sap.ui.model.json.JSONModel({
                Skills: []
            });
            this.getView().setModel(oSkillModel, "skillModel");


            // Attach route pattern matched
            this.getOwnerComponent().getRouter()
                .getRoute("RouteCreatePage")
                .attachPatternMatched(this._onRouteMatched, this);
        },
        
        _onRouteMatched: function () {
            const oView = this.getView();
        
            // Clear input fields
            oView.byId("i_fname").setValue("");
            oView.byId("i_lname").setValue("");
            oView.byId("i_age").setValue("");
            oView.byId("i_eid").setValue("");
        
            // Reset dropdowns
            oView.byId("sel_clvl").setSelectedKey(null);
            oView.byId("sel_cproj").setSelectedKey(null);
        
            // Reset date picker to today
            const oToday = new Date();
            const oDatePicker = oView.byId("datePicker");
            oDatePicker.setDateValue(oToday);
        
            // Reset skills model
            const oSkillModel = oView.getModel("skillModel");
            if (oSkillModel) {
                oSkillModel.setProperty("/Skills", []);
            }
        },

        onCancelCreate: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("RouteEmployeeList", null, true);
			}
		},

        onClickSave: function(){
            var oView = this.getView();
            var sNewFname = oView.byId("i_fname").getValue();
            var sNewLname = oView.byId("i_lname").getValue();
            var sNewAge = oView.byId("i_age").getValue();

            var oDate = oView.byId("datePicker").getDateValue();

            // Format DDMM for EmployeeID
            var sDateForEid = 
                String(oDate.getDate()).padStart(2, '0') +
                String(oDate.getMonth() + 1).padStart(2, '0');

            // Format full date as MM/DD/YYYY for DateHire
            var sNewHdate = `${String(oDate.getMonth() + 1).padStart(2, '0')}/` +
                            `${String(oDate.getDate()).padStart(2, '0')}/` +
                            `${oDate.getFullYear()}`;

            var sNewClvl = oView.byId("sel_clvl").getSelectedItem().getText();
            var sNewCproj = oView.byId("sel_cproj").getSelectedItem().getText();

            // Construct EmployeeID
            var sGeneratedEid = `EmployeeID${sNewLname}${sNewFname}${sDateForEid}`;

            var oData = {
                FirstName: sNewFname,
                LastName: sNewLname,
                EmployeeID: sGeneratedEid,
                Age: sNewAge,
                DateHire: sNewHdate,
                CareerLevel: sNewClvl,
                CurrentProject: sNewCproj
            }                   

            /*
            * Update the Data
            */
            //Get the Model
            var oModel = this.getOwnerComponent().getModel();
            var sEntity = "/EMPLOYEE"
            
            oModel.create(sEntity, oData,{
                success: (data)=>{
                    sap.m.MessageToast.show("Employee Records Created Successfully!"); //Change to Message Box
                    this.getOwnerComponent().getRouter().navTo("RouteEmployeeList", null, true);
                },
                error: ()=>{
                }
            })
        },

        onAddSkill: function (){
            if (!this.oDialog) {
                this.oDialog = this.loadFragment({
                    name: "sapips.training.employeeapp.fragment.EmployeeAddSkill"
                });
            } 

            this.oDialog.then(function(oDialog) {
                oDialog.open();
            });
        },

        onCancelDialog: function(){
            this.getView().byId("idAddSkill").close();
        },

        onPressDelete: function(){
            // var oTable = this.byId("idSkillList");
            // var aSelectedItems = oTable.getSelectedItems();
        
            // if (!aSelectedItems.length) {
            //     sap.m.MessageToast.show("Please select at least one row to delete."); //Change to Message Box
            //     return;
            // }

            // aSelectedItems.forEach(function (oItem) {
            //     oTable.removeItem(oItem);
            // });

            // oTable.removeSelections();

            var oTable = this.byId("idSkillList");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageBox.warning("Must select at least 1 employee.");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected skill/s?", {
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
                                        MessageBox.success("Selected skill(s) deleted successfully.");
                                    }
                                },
                                error: function () {
                                    bErrorOccurred = true;
                                    MessageBox.error("Failed to delete one or more skills.");
                                }
                            });
                        });

                        oTable.removeSelections();
                    }
                }.bind(this)
            });
        },

        onPressAdd: function (){
            var oView = this.getView();

            var sNewSkill = oView.byId("sel_skills").getSelectedItem()?.getText();
            var sNewProf = oView.byId("sel_prof").getSelectedItem()?.getText();
        
            if (!sNewSkill || !sNewProf) {
                sap.m.MessageToast.show("Please select both Skill and Proficiency."); //Change to Message Box
                return;
            }
        
            var oData = {
                SkillName: sNewSkill,
                ProficiencyLevel: sNewProf
            };
        
            var oModel = this.getOwnerComponent().getModel();
            var sEntity = "/SKILL";
        
            oModel.create(sEntity, oData, {
                success: (data) => {
                    sap.m.MessageToast.show("Skill added successfully!"); //Change to Message Box
                    this.getView().byId("idAddSkill").close();
                    
                    //Creation of Employee Details with Skills 
                    var oModel2 = this.getOwnerComponent().getModel();
                    var sEntity2 = "/CREATEMPLOYEE";

                    oModel.create(sEntity, oData, {

                    });

                },
                error: () => {
                    sap.m.MessageToast.show("Failed to add skill.");
                }
            });

        },

        onNameChange: function () {
            const oView = this.getView();
            const sFirstName = oView.byId("i_fname").getValue().trim();
            const sLastName = oView.byId("i_lname").getValue().trim();
            const oDatePicker = oView.byId("datePicker");
        
            if (sFirstName && sLastName && oDatePicker) {                
                const oDate = oDatePicker.getDateValue() || new Date();
        
                // Format date as DDMM with leading zeroes
                const sFormattedDate = 
                    String(oDate.getDate()).padStart(2, '0') +
                    String(oDate.getMonth() + 1).padStart(2, '0');
        
                // Generate Employee ID
                const sGeneratedId = `EmployeeID${sLastName}${sFirstName}${sFormattedDate}`;
                oView.byId("i_eid").setValue(sGeneratedId);
            } else {
                // Clear ID if inputs are incomplete
                oView.byId("i_eid").setValue("");
            }
        }

    });
});