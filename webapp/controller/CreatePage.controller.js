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
        },

        onCancelCreate: function () {
			let sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("RouteEmployeeList", null, true);
			}
            let oModel = this.getOwnerComponent().getModel();

            // Clear Skill List
            oModel.read("/SKILL", {
                success: function (oData) {
                    oData.results.forEach(function (oEntry) {
                        oModel.remove(`/SKILL(SkillID='${oEntry.SkillID}',EmployeeID='${oEntry.EmployeeID}')`);
                    });
                }
            });
		},

        onClickSave: function(){
            let oView = this.getView();
            let sNewFname = oView.byId("i_fname").getValue();
            let sNewLname = oView.byId("i_lname").getValue();
            let sNewAge = oView.byId("i_age").getValue();
        
            let oFname = oView.byId("i_fname");
            let oLname = oView.byId("i_lname");
            let oAge   = oView.byId("i_age");
            
            let bValid = true;
            
            let nameRegex = /^[A-Za-z\s\-]+$/;
            let ageRegex = /^[0-9]+$/;
            
            if (!sNewFname || !nameRegex.test(sNewFname)) {
                oFname.setValueState("Error");
                oFname.setValueStateText("This field is required and must contain valid name.");
                bValid = false;
            } else {
                oFname.setValueState("None");
            }
            
            if (!sNewLname || !nameRegex.test(sNewLname)) {
                oLname.setValueState("Error");
                oLname.setValueStateText("This field is required and must contain valid name.");
                bValid = false;
            } else {
                oLname.setValueState("None");
            }
            
            let iAge = parseInt(sNewAge);
            if (!sNewAge || !ageRegex.test(sNewAge) || iAge <= 0 || iAge > 90) {
                oAge.setValueState("Error");
                oAge.setValueStateText("Required field. Enter age between 1 and 90");
                bValid = false;
            } else {
                oAge.setValueState("None");
            }
            
            if (!bValid) {
                return; 
            }

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
                MessageBox.warning("Employee must have at least one skill.");
                return;
            }

            //Get the Model
            let oModel = this.getOwnerComponent().getModel();
            let sEntity = "/EMPLOYEE"
            
            oModel.create(sEntity, oData,{
                success: (data)=>{
                    MessageBox.success("Employee Records Created Successfully!");
                    this.getOwnerComponent().getRouter().navTo("RouteEmployeeList", null, true);

                    // Clear Skill List
                    oModel.read("/SKILL", {
                        success: function (oData) {
                            oData.results.forEach(function (oEntry) {
                                oModel.remove(`/SKILL(SkillID='${oEntry.SkillID}',EmployeeID='${oEntry.EmployeeID}')`);
                            });
                        }
                    });
                },
                error: ()=>{
                    MessageBox.error("Employee Records Not Created");
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
                MessageBox.warning("Must select at least 1 employee.");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected skill/s?", {
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
            let oView = this.getView();

            let sNewSkill = oView.byId("sel_skills").getSelectedItem()?.getText();
            let sNewProf = oView.byId("sel_prof").getSelectedItem()?.getText();
        
            if (!sNewSkill || !sNewProf) {
                MessageBox.information("Please select both Skill and Proficiency.");
                return;
            }
        
            let oData = {
                SkillName: sNewSkill,
                ProficiencyID: sNewProf
            };
        
            let oModel = this.getOwnerComponent().getModel();
            let sEntity = "/SKILL";
        
            oModel.create(sEntity, oData, {
                success: (data) => {
                    MessageBox.success("Skill added successfully!");
                    this.getView().byId("idAddSkill").close();
                },
                error: () => {
                    MessageBox.error("Failed to add skill.");
                }
            });

        },

        onNameChange: function () {
            const oView = this.getView();
            const oFnameInput = oView.byId("i_fname");
            const oLnameInput = oView.byId("i_lname"); 

            // FIRST NAME - Can only accept hyphen symbol
            let sFirstName = oFnameInput.getValue();
                sFirstName = sFirstName.replace(/[^A-Za-z\s\-]/g, ""); 
                    if (sFirstName.startsWith("-")) 
                    { 
                     sFirstName = sFirstName.slice(1);
                     }
                     oFnameInput.setValue(sFirstName);

            // LAST NAME - Can only accept hyphen symbol
            let sLastName = oLnameInput.getValue();
                sLastName = sLastName.replace(/[^A-Za-z\s\-]/g, ""); 
                    if (sLastName.startsWith("-")) 
                    {
                    sLastName = sLastName.slice(1); 
                    }
                    oLnameInput.setValue(sLastName); 

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
        },

        onAgeChange: function (oEvent) {
                const oInput = oEvent.getSource();
                let sValue = oInput.getValue();

                // Allow only numbers
                sValue = sValue.replace(/[^0-9]/g, "");

                // Prevent values > 90
                let iAge = parseInt(sValue, 10);
                if (iAge > 90) {
                    sValue = "90";
                }
                // Set the cleaned value back
                oInput.setValue(sValue);
        }       
    });
});