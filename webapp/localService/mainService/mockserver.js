sap.ui.define([

    "sap/ui/core/util/MockServer"

], function (MockServer) {

    "use strict";



    var oMockServer,

        _sAppModulePath = "sapips/training/employeeapp/",

        _sJsonFilesModulePath = _sAppModulePath + "localService/data";



    return {

        /**

         * Initializes the mock server.

         * You can configure the delay with the URL parameter "serverDelay".

         * The local mock data in this folder is returned instead of the real data for testing.

         * @public

         */



        init : function () {

            var oUriParameters = jQuery.sap.getUriParameters(),

                sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),

                sEntity = "EMPLOYEE, CAREERLIST, PROFICIENCYLIST, PROJECTLIST, SKILL, SKILLLIST",

                sErrorParam = oUriParameters.get("errorType"),

                iErrorCode = sErrorParam === "badRequest" ? 400 : 500,

                oMainDataSource = "/sap/opu/odata/sap/EMPLOYEE_SRV",

                sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + "localService/mainService/data",".xml"),

                // ensure there is a trailing slash

                sMockServerUrl = /.*\/$/.test(oMainDataSource) ? oMainDataSource : oMainDataSource + "/";



            oMockServer = new MockServer({

                rootUri : sMockServerUrl

            });



            // configure mock server with a delay of 1s

            MockServer.config({

                autoRespond : true,

                autoRespondAfter : (oUriParameters.get("serverDelay") || 1000)

            });



            oMockServer.simulate(sMetadataUrl, {

                sMockdataBaseUrl : sJsonFilesUrl,

                bGenerateMissingMockData : true

            });



            var aRequests = oMockServer.getRequests(),

                fnResponse = function (iErrCode, sMessage, aRequest) {

                    aRequest.response = function(oXhr){

                        oXhr.respond(iErrCode, {"Content-Type": "text/plain;charset=utf-8"}, sMessage);

                    };

                };



            // handling the metadata error test

            if (oUriParameters.get("metadataError")) {

                aRequests.forEach( function ( aEntry ) {

                    if (aEntry.path.toString().indexOf("$metadata") > -1) {

                        fnResponse(500, "metadata Error", aEntry);

                    }

                });

            }



            // Handling request errors

            if (sErrorParam) {

                aRequests.forEach( function ( aEntry ) {

                    if (aEntry.path.toString().indexOf(sEntity) > -1) {

                        fnResponse(iErrorCode, sErrorParam, aEntry);

                    }

                });

            }

            oMockServer.start();



            jQuery.sap.log.info("Running the app with mock data");

        },



        /**

         * @public returns the mockserver of the app, should be used in integration tests

         * @returns {sap.ui.core.util.MockServer} the mockserver instance

         */

        getMockServer : function () {

            return oMockServer;

        }

    };



}

);