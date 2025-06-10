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
            let oDatePicker = this.byId("datePicker");
            let oToday = new Date();
            let oMaxDate = new Date();
            oMaxDate.setFullYear(oMaxDate.getFullYear() + 1); // +1 year from today
        
            // Set default value (today)
            oDatePicker.setDateValue(oToday);
        
            // Set min and max dates
            oDatePicker.setMinDate(oToday);
            oDatePicker.setMaxDate(oMaxDate);

            let oModel = new sap.ui.model.json.JSONModel({
                selectedDate: oToday
            });

            // Attach route pattern matched
            this.getOwnerComponent().getRouter()
                .getRoute("RouteCreatePage")
                .attachPatternMatched(this.onRouteMatched, this);
        },
        
        onRouteMatched: function () {
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

            // Get the table Skills
            let oTable = this.getView().byId("idSkillList");
        
            // Clear the items in the table
            oTable.removeAllItems();
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

        onCancelCreate: function () {
			let sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("RouteEmployeeList", null, true);
			}
            let oModel = this.getOwnerComponent().getModel();
		},

        onClickSave: function(){
            let oView = this.getView();
            let sNewFname = oView.byId("i_fname").getValue();
            let sNewLname = oView.byId("i_lname").getValue();
            let sNewAge = oView.byId("i_age").getValue();

            let oDate = oView.byId("datePicker").getDateValue();

            // Format DDMM for EmployeeID
            let sDateForEid = 
                String(oDate.getDate()).padStart(2, '0') +
                String(oDate.getMonth() + 1).padStart(2, '0');

            // Format full date as MM/DD/YYYY for DateHire
            let sNewHdate = `${String(oDate.getMonth() + 1).padStart(2, '0')}/` +
                            `${String(oDate.getDate()).padStart(2, '0')}/` +
                            `${oDate.getFullYear()}`;

            let sNewClvl = oView.byId("sel_clvl").getSelectedItem().getText();
            let sNewCproj = oView.byId("sel_cproj").getSelectedItem().getText();

            // Construct EmployeeID
            let sGeneratedEid = `EmployeeID${sNewLname}${sNewFname}${sDateForEid}`;

            let oData = {
                FirstName: sNewFname,
                LastName: sNewLname,
                EmployeeID: sGeneratedEid,
                Age: sNewAge,
                DateHire: sNewHdate,
                CareerLevel: sNewClvl,
                CurrentProject: sNewCproj
            }
            
            // Validate skill list has at least one skill
            let oSkillTable = oView.byId("idSkillList");
            let aSkills = oSkillTable.getItems();

            if (aSkills.length === 0) {
                this.showMessageBox("warning", "msg_noSkills");
                return;
            }

            //Get the Model
            let oModel = this.getOwnerComponent().getModel();
            let sEntity = "/EMPLOYEE"
            
            oModel.create(sEntity, oData,{
                success: (data)=>{
                    this.showMessageBox("success", "msg_created");
                    this.getOwnerComponent().getRouter().navTo("RouteEmployeeList", null, true);
                },
                error: ()=>{
                    this.showMessageBox("error", "msg_failedCreate");
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
            let oTable = this.byId("idSkillList");
            let aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                this.showMessageBox("warning", "msg_noSelected");
                return;
            }

            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            const sConfirmText = oResourceBundle.getText("msg_deleteConfirm");

            MessageBox.confirm(sConfirmText, {
                onClose:(oAction) => {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        let oModel = this.getOwnerComponent().getModel();
                        let iPending = aSelectedItems.length;
                        let bErrorOccurred = false;
                        
                        aSelectedItems.forEach(function (oItem) {
                            let sPath = oItem.getBindingContext().getPath();

                            oModel.remove(sPath, {
                                success:() => {
                                    iPending--;
                                    if (iPending === 0 && !bErrorOccurred) {
                                        this.showMessageBox("success", "msg_deleteSuccess");
                                    }
                                },
                                error:() => {
                                    bErrorOccurred = true;
                                    this.showMessageBox("error", "msg_deleteFail");
                                }
                            });
                        });

                        oTable.removeSelections();
                    }
                }
            });
        },

        onPressAdd: function (){
            let oView = this.getView();
            
            let sNewSkill = oView.byId("sel_skills").getSelectedItem()?.getText();
            let sNewProf = oView.byId("sel_prof").getSelectedItem()?.getText();
        
            if (!sNewSkill || !sNewProf) {
                this.showMessageBox("information", "msg_selectSkillProf");
                return;
            }
            let oData = {   
                ProficiencyID: sNewProf,
                SkillName: sNewSkill
            };
        
            let oModel = this.getOwnerComponent().getModel();
            let sEntity = "/SKILL";
        
            oModel.create(sEntity, oData, {
                success: (data) => {
                    this.showMessageBox("success", "msg_addSkillSuccess");
                    this.getView().byId("idAddSkill").close();
                },
                error: () => {
                    this.showMessageBox("error", "msg_addSkillFail");
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