/**
 * This is a quick start example of listing the user's envelopes. 
 * Language: Node.js
 * 
 * See the Readme and Setup files for more information.
 * 
 * Copyright (c) DocuSign, Inc.
 * License: MIT Licence. See the LICENSE file.
 * 
 * This example does not include authentication. Instead, an access token
 * must be supplied from the Token Generator tool on the DevCenter or from
 * elsewhere.
 * 
 * This example also does not look up the DocuSign account id to be used.
 * Instead, the account id must be set. 
 * 
 * For a more production oriented example, see:
 *   JWT authentication: https://github.com/docusign/eg-01-node-jwt 
 *   or Authorization code grant authentication. Includes express web app:
 *      https://github.com/docusign/eg-03-node-auth-code-grant 
 * @file index.js
 * @author DocuSign
 * @see <a href="https://developers.docusign.com">DocuSign Developer Center</a>
 */
const docusign = require('docusign-esign')
    , process = require('process')
    , moment = require('moment')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , basePath = 'https://demo.docusign.net/restapi'
    , express = require('express')
    , envir = process.env
    ;

async function listEnvelopesController (req, res) {
  const qp =req.query;
  // Fill in these constants or use query parameters of ACCESS_TOKEN and ACCOUNT_ID
  // or environment variables.

  // Obtain an OAuth token from https://developers.hqtest.tst/oauth-token-generator
  const accessToken = envir.ACCESS_TOKEN || qp.ACCESS_TOKEN || '{access_token}';

  // Obtain your accountId from demo.docusign.com -- the account id is shown in the drop down on the
  // upper right corner of the screen by your picture or the default picture. 
  const accountId = envir.ACCOUNT_ID || qp.ACCOUNT_ID || '{account_id}'; 

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Step 1. Prepare the request object
   */
  let options = {fromDate: moment().subtract(10, 'days').format()};
  /**
   * Step 2. Get and display the results
   *         We're using a promise version of the SDK's listStatusChanges method.
   */
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
  // Set the DocuSign SDK components to use the apiClient object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  let envelopesApi = new docusign.EnvelopesApi()
      // createEnvelopePromise returns a promise with the results:
    , listStatusChangesPromise = promisify(envelopesApi.listStatusChanges).bind(envelopesApi)
    , results
    ;

  try {
    results = await listStatusChangesPromise(accountId, options)
  } catch  (e) {
    let body = e.response && e.response.body;
    if (body) {
      // DocuSign API exception
      res.send (`<html lang="en"><body>
                  <h3>API problem</h3><p>Status code ${e.response.status}</p>
                  <p>Error message:</p><p><pre><code>${JSON.stringify(body, null, 4)}</code></pre></p>`);
    } else {
      // Not a DocuSign exception
      throw e;
    }
  }
  // Process results:
  if (results) {
    res.send (`<html lang="en"><body>
                <h3>Listing your envelopes that were created in the last 10 days</h3>
                <p>Results</p><p><pre><code>${JSON.stringify(results, null, 4)}</code></pre></p>`);
  }
}

// The mainline
const port = process.env.PORT || 3000
    , host = process.env.HOST || 'localhost'
    , app = express()
       .get('/', listEnvelopesController)
       .listen(port, host);
console.log(`Your server is running on ${host}:${port}`);
