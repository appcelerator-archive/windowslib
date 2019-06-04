#! groovy
library 'pipeline-library'
// TODO: Could we make this an array and test across multiple major versions
def nodeVersion = '8.11.4'

def unitTests(os, nodeVersion) {
  return {
    node(os) {
      nodejs(nodeJSInstallationName: "node ${nodeVersion}") {
        stage('Test') {
          timeout(15) {
            unstash 'sources'
            // Install yarn if not installed
            if('windows'.equals(os)) {
              if (bat(returnStatus: true, script: 'where yarn') != 0) {
                bat 'npm install -g yarn'
              }
              bat 'yarn install'
            } else {
              if (sh(returnStatus: true, script: 'which yarn') != 0) {
                sh 'npm install -g yarn'
              }
              sh 'yarn install'
           }
           fingerprint 'package.json'
            try {
              if('windows'.equals(os)) {
                bat 'yarn run coverage'
              } else {
                sh 'yarn run coverage'
              }
            } finally {
              // record results even if tests/coverage 'fails'
              junit 'junit.xml'
            }
          } // timeout
        } // test
      } // nodejs
    }  // node
  }
}

timestamps {
  def isMaster = false
  def packageVersion

  stage('Test') {
    parallel(
      'Windows unit tests': unitTests('windows', nodeVersion),
      failFast: false
	)
  } // Test

} // timestamps
