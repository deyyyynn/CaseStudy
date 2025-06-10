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

            let oDate = oView.byId("datePicker").getDateValue();

            let oTable = oView.byId("idSkillList");
            let dTableData = oTable.getItems(); 
            if(!dTableData || dTableData.length === 0){
                MessageToast.show("Please add atleast 1 skill!");
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
                    MessageToast.show("All skills added successfully!");
                },
                error: function () {
                    MessageToast.show("Error adding skills.");
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
            var oView = this.getView();
            var oModel = oView.getModel("skillsModel");
            var oTable = oView.byId("idSkillList");
            // Get all selected items
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one skill to delete!");
                return;
            }
            // Get all SkillIDs to be deleted
            var aSelectedSkillIDs = aSelectedItems.map(item => item.getBindingContext("skillsModel").getProperty("SkillID"));
            // Filter out selected skills from SkillsData
            var aSkillsData = oModel.getProperty("/SkillsData");
            var aUpdatedSkills = aSkillsData.filter(skill => !aSelectedSkillIDs.includes(skill.SkillID));
            // Update Model
            oModel.setProperty("/SkillsData", aUpdatedSkills);
            // Clear Table Selection
            oTable.removeSelections();
            oModel.refresh(true);
            MessageToast.show(aSelectedItems.length + " skill(s) deleted!");
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