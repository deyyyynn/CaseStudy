sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/m/library",
    "sap/ui/core/BusyIndicator"
], (Controller, JSONModel, MessageBox, History, BusyIndicator,mobileLibrary) => {
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

            //Clear Skill List Before Create
            this.getView().setModel(new JSONModel({ SKILL: [] }), "createModel");

            // Initialize Empty Model (Created on Button Press)
            let oSkillModel = new JSONModel({
                SkillsData: []
            });
            this.getView().setModel(oSkillModel, "skillsModel");
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
            let sNewEmployeeID = oView.byId("i_eid").getValue();
        
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

            let oTable = oView.byId("idSkillList");
            let dTableData = oTable.getItems(); 
            if(!dTableData || dTableData.length === 0){
                this.showMessageBox("warning", "msg_noSelected");
            }

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
        
            let mParameters = {};

            // Enable batch processing
            oModel.setDeferredGroups(["batchSkill"]);
            mParameters.groupId = "batchSkill";

            dTableData.forEach(function (oItem) {
                let oContext = oItem.getBindingContext("skillsModel"); // Get row binding context
                let oData = oContext.getObject(); // Extract row data
                
                oData.EmployeeID = sNewEmployeeID;
                // Add each skill to the batch request
                oModel.create("/SKILL", oData, mParameters);
            });

            // Submit batch request
            oModel.submitChanges({
                groupId: "batchSkill",
                success: function () {
                    this.showMessageBox("success", "msg_addSkillSuccess");
                },
                error: function () {
                    this.showMessageBox("error", "msg_addSkillFail");
                }
            });
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
          
            let oView = this.getView();
            let oModel = oView.getModel("skillsModel");
            let oTable = oView.byId("idSkillList");
            // Get all selected items
          
            let aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                this.showMessageBox("warning", "msg_noSelected");
                return;
            }
            // Get all SkillIDs to be deleted
            let aSelectedSkillIDs = aSelectedItems.map(item => item.getBindingContext("skillsModel").getProperty("SkillID"));
            // Filter out selected skills from SkillsData
            let aSkillsData = oModel.getProperty("/SkillsData");
            let aUpdatedSkills = aSkillsData.filter(skill => !aSelectedSkillIDs.includes(skill.SkillID));
            // Update Model
            oModel.setProperty("/SkillsData", aUpdatedSkills);
            // Clear Table Selection
            oTable.removeSelections();
            oModel.refresh(true);
            this.showMessageBox("success", "msg_deleteSuccess");
        },

        onPressAdd: function (){
            let oView = this.getView();
            let oModel = oView.getModel("skillsModel");
            let oSkillComboBox = oView.byId("sel_skills");
            let oProficiencyComboBox = oView.byId("sel_prof");
            let oSelectedSkill = oSkillComboBox.getSelectedItem();
            let oSelectedProficiency = oProficiencyComboBox.getSelectedItem();
            if (!oSelectedSkill || !oSelectedProficiency) {
                this.showMessageBox("information", "msg_selectSkillProf");
                return;
            }
            let sSkillID = oSelectedSkill.getKey();
            let sSkillName = oSelectedSkill.getText();
            let sProficiencyID = oSelectedProficiency.getText();
            let sProficiency = oSelectedProficiency.getKey();
            let aSkillsData = oModel.getProperty("/SkillsData");
            let oSkillPayLoad = {
                SkillID : sSkillID,
                SkillName : sSkillName,
                ProficiencyID : sProficiencyID,
                ProficiencyLevel : sProficiency
            };

            //Check for Duplicate Entry
            let bExists = aSkillsData.some(skill => skill.SkillID === sSkillID);
            if (bExists) {
                this.showMessageBox("warning", "msg_SkillDup");
                return;
            }

            // Add to SkillsData Array
            aSkillsData.push(oSkillPayLoad);
            oModel.setProperty("/SkillsData", aSkillsData);
            oModel.refresh(true);
            this.getView().byId("idAddSkill").close();
            this.showMessageBox("success", "msg_addSkillSuccess");
            
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