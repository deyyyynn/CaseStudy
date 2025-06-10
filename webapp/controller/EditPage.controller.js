sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
], function (Controller, JSONModel, Filter, MessageBox, BusyIndicator) {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EditPage", {

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteEditPage")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            const sEmployeeID = oEvent.getParameter("arguments").EmployeeID;
            const sProficiencyID = oEvent.getParameter("arguments").ProficiencyID; // If needed later
            const oModel = this.getOwnerComponent().getModel();
            const oView = this.getView();

            const oEmpFilter = new sap.ui.model.Filter("EmployeeID", sap.ui.model.FilterOperator.EQ, sEmployeeID);


            // Fetch employee details
            oModel.read("/EMPLOYEE", {
                filters: [oEmpFilter],
                success: function (oData) {
                    if (oData.results && oData.results.length > 0) {
                        const oEmpModel = new sap.ui.model.json.JSONModel(oData.results[0]);
                        oView.setModel(oEmpModel, "employeedetails");
                    } else {
                        sap.m.MessageBox.error("No employee found with ID " + sEmployeeID);
                    }
                },
                error: function () {
                    sap.m.MessageBox.error("Failed to load employee data.");
                }
            });

            // Fetch employee skills
            oModel.read("/SKILL", {
                filters: [oEmpFilter],
                success: function (oData) {
                    const oSkillsModel = new sap.ui.model.json.JSONModel({ SKILL: oData.results });
                    oView.setModel(oSkillsModel, "skills");
                },
                error: function () {
                    sap.m.MessageBox.error("Failed to load employee skills.");
                }
            });
        },

        onAddSkill: function () {
            if (!this.oDialog) {
                this.oDialog = this.loadFragment({
                    name: "sapips.training.employeeapp.fragment.EmployeeAddSkill"
                });
            }

            this.oDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCancelDialog: function () {
            this.getView().byId("idAddSkill").close();
        },
        onPressDelete: function () {

            var oView = this.getView();
            var oModel = oView.getModel("skills");
            var oTable = oView.byId("idSkillList1");

            // Get all selected items
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                MessageBox.show("Please select at least one skill to delete!");
                return;
            }

            // Get all SkillIDs to be deleted
            var aSelectedSkillIDs = aSelectedItems.map(item =>
                item.getBindingContext("skills").getProperty("SkillID")
            );

            // Filter out selected skills from SkillsData
            var aSkillsData = oModel.getProperty("/SKILL");
            var aUpdatedSkills = aSkillsData.filter(skill =>
                !aSelectedSkillIDs.includes(skill.SkillID)
            );

            // Update Model
            oModel.setProperty("/SKILL", aUpdatedSkills);

            // Clear Table Selection
            oTable.removeSelections();
            oModel.refresh(true);

        },

        onPressAdd: function () {

            var oView = this.getView();
            var oModel = oView.getModel("skills");
            var oSkillComboBox = oView.byId("sel_skills");
            var oProficiencyComboBox = oView.byId("sel_prof");
            var oSelectedSkill = oSkillComboBox.getSelectedItem();
            var oSelectedProficiency = oProficiencyComboBox.getSelectedItem();
            if (!oSelectedSkill || !oSelectedProficiency) {
                MessageBox.show("Please select both Skill and Proficiency Level!");
                return;
            }
            var sSkillID = oSelectedSkill.getKey();
            var sSkillName = oSelectedSkill.getText();
            var sProficiencyID = oSelectedProficiency.getText();
            var sProficiency = oSelectedProficiency.getKey();
            var aSkillsData = oModel.getProperty("/SKILL");
            let oSkillPayLoad = {
                SkillID: sSkillID,
                SkillName: sSkillName,
                ProficiencyID: sProficiencyID,
                ProficiencyLevel: sProficiency
            };
            //Check for Duplicate Entry
            var bExists = aSkillsData.some(skill => skill.SkillID === sSkillID);
            if (bExists) {
                MessageBox.show("Skill already added!");
                return;
            }
            // Add to SkillsData Array
            aSkillsData.push(oSkillPayLoad);
            oModel.setProperty("/SKILL", aSkillsData);
            //oModel.setProperty("/skillsCount", aSkillsData.length());
            oModel.refresh(true);
            this.getView().byId("idAddSkill").close();
            MessageBox.show("Skill Added!");


        },

        onClickBack: function () {
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteViewPage", { EmployeeID: oEmpData.EmployeeID }, true);
            }
        },
        onClickCancel: function (oEvent) {
            let oRouter = this.getOwnerComponent().getRouter();
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            let oEmpData = { EmployeeID: this.getView().byId("id_empid").getValue() };

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                oRouter.navTo("RouteViewPage", {
                    EmployeeID: oEmpData.EmployeeID
                });
            }
        },
        onClickSave: function () {
            let oView = this.getView();
            let oModel = this.getOwnerComponent().getModel();
            let oRouter = this.getOwnerComponent().getRouter();
            let sEmployeeID = oView.byId("id_empid").getValue();
            let aEmployeeID = oView.byId("idSkillList1").getItems();
            // Gather employee data from inputs
            let oEmpData = {
                FirstName: oView.byId("id_fname").getValue(),
                LastName: oView.byId("id_lname").getValue(),
                EmployeeID: oView.byId("id_empid").getValue(),
                Age: oView.byId("id_age").getValue(),
                DateHire: oView.byId("id_date").getValue(),
                CareerLevel: oView.byId("id_career").getSelectedKey(),
                CurrentProject: oView.byId("id_project").getSelectedKey()
            };

            // Retrieve Skill ID based on EmployeeID
            let sNewFname = oView.byId("id_fname").getValue();
            let sNewLname = oView.byId("id_lname").getValue();
            let sNewAge = oView.byId("id_age").getValue();

            let oFname = oView.byId("id_fname");
            let oLname = oView.byId("id_lname");
            let oAge = oView.byId("id_age");

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

            let oSkillModel = this.getView().getModel("skills");
            let aSkillData = oSkillModel.getData();
            // let aEmployeeSkills = aSkillData.filter(function (skill) {
            //   return skill.EmployeeID === oEmpData.EmployeeID;
            // });

            // Update the employee data
            let sEmpPath = "/EMPLOYEE('" + oEmpData.EmployeeID + "')";
            let oEmpEntry = {
                FirstName: oEmpData.FirstName,
                LastName: oEmpData.LastName,
                Age: oEmpData.Age,
                DateHire: oEmpData.DateHire,
                CareerLevel: oEmpData.CareerLevel,
                CurrentProject: oEmpData.CurrentProject
            };

            oModel.update(sEmpPath, oEmpEntry, {
                success: function () {
                    sap.m.MessageBox.show("Employee updated successfully");

                    oRouter.navTo("RouteViewPage", {
                        EmployeeID: oEmpData.EmployeeID
                    }, true);
                    oModel.refresh(true);

                },
                error: function () {
                    sap.m.MessageBox.show("Error updating employee");
                }
            });

            let oSkillModel1 = oView.getModel("skills");
            let aSkillData1 = oSkillModel1.getProperty("/SKILL"); // all skill entries
            let aToDelete = aSkillData1.filter(skill => skill.EmployeeID === sEmployeeID);

            aToDelete.forEach(function (oSkill) {
                oModel.remove("/SKILL(EmployeeID='" + oSkill.EmployeeID + "',SkillID='" + oSkill.SkillID + "')", {
                    success: function () {
                        // Deletion success (optional: toast)
                    }.bind(this),
                    error: function (oError) {
                        MessageBox.error("Error deleting old skills.");
                    }.bind(this)
                });
            }, this);


            let mParameters = {};
            let oTable = oView.byId("idSkillList1");
            let dTableData = oTable.getItems();
            if (!dTableData || dTableData.length === 0) {
                MessageBox.show("Please add atleast 1 skill!");
                return;
            }
            // Enable batch processing
            oModel.setDeferredGroups(["batchSkill"]);
            mParameters.groupId = "batchSkill";

            dTableData.forEach(function (oItem) {
                let oContext = oItem.getBindingContext("skills"); // Get row binding context
                let oData = oContext.getObject(); // Extract row data

                oData.EmployeeID = sEmployeeID;
                // Add each skill to the batch request
                oModel.create("/SKILL", oData, mParameters);
            });

            // Submit batch request
            oModel.submitChanges({
                groupId: "batchSkill",
                success: function () {
                    MessageBox.show("All skills added successfully!");
                    oModel.refresh(true);
                },
                error: function () {
                    MessageBox.show("Error adding skills.");
                }
            });

        },
        onAgeChange: function (oEvent) {
            // Age field validation
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

        },
        onNameChange: function () {
            // First Name and Last Name validation
            const oView = this.getView();
            const oFnameInput = oView.byId("id_fname");
            const oLnameInput = oView.byId("id_lname");

            // FIRST NAME - Can only accept hyphen symbol
            let sFirstName = oFnameInput.getValue();
            sFirstName = sFirstName.replace(/[^A-Za-z\s\-]/g, "");
            if (sFirstName.startsWith("-")) {
                sFirstName = sFirstName.slice(1);
            }
            oFnameInput.setValue(sFirstName);

            // LAST NAME - Can only accept hyphen symbol
            let sLastName = oLnameInput.getValue();
            sLastName = sLastName.replace(/[^A-Za-z\s\-]/g, "");
            if (sLastName.startsWith("-")) {
                sLastName = sLastName.slice(1);
            }
            oLnameInput.setValue(sLastName);

            const oDatePicker = oView.byId("id_date");

            if (sFirstName && sLastName && oDatePicker) {
                const oDate = oDatePicker.getDateValue() || new Date();

                // Format date as DDMM with leading zeroes
                const sFormattedDate =
                    String(oDate.getDate()).padStart(2, '0') +
                    String(oDate.getMonth() + 1).padStart(2, '0');

                // Generate Employee ID
                const sGeneratedId = `EmployeeID${sLastName}${sFirstName}${sFormattedDate}`;
                oView.byId("id_empid").setValue(sGeneratedId);
            } else {
                // Clear ID if inputs are incomplete
                oView.byId("id_empid").setValue("");
            }
        }

    });
});
