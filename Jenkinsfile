#! groovy
library 'pipeline-library'

def nodeVersion = '8.9.1' // changing requires setting version up on Jenkisn first, ask Chris or Alan to help

timestamps {
  node('windows && windows-sdk-10 && windows-sdk-8.1 && (vs2015 || vs2017) && npm-publish') {
    def packageVersion = ''
    def isMaster = false
    stage('Checkout') {
      // checkout scm
      // Hack for JENKINS-37658 - see https://support.cloudbees.com/hc/en-us/articles/226122247-How-to-Customize-Checkout-for-Pipeline-Multibranch
      checkout([
        $class: 'GitSCM',
        branches: scm.branches,
        extensions: scm.extensions + [[$class: 'CleanBeforeCheckout']],
        userRemoteConfigs: scm.userRemoteConfigs
      ])

      isMaster = env.BRANCH_NAME.equals('master')
      packageVersion = jsonParse(readFile('package.json'))['version']
      currentBuild.displayName = "#${packageVersion}-${currentBuild.number}"
    }

    nodejs(nodeJSInstallationName: "node ${nodeVersion}") {
      ansiColor('xterm') {
        timeout(20) {
          stage('Build') {
            bat 'npm install'
            // Try to kill any running emulators first?
            bat returnStatus: true, script: 'taskkill /IM xde.exe'
            // And stop them too!
            bat returnStatus: true, script: 'powershell -NoLogo -ExecutionPolicy ByPass -Command "& {Stop-VM *}"'
            withEnv(['JUNIT_REPORT_PATH=junit_report.xml']) {
              bat returnStatus: true, script: 'npm test' // ignore bad exit code if tests fail, don't fail build
            }
            junit 'junit_report.xml'
            fingerprint 'package.json'
          } // stage
        } // timeout

        stage('Security') {
          // Clean up and install only production dependencies
          bat 'npm prune --production'

          // Scan for NSP and RetireJS warnings
          bat 'npm install --global nsp@2.8.1'
          bat 'nsp check --output summary --warn-only'

          bat 'npm install --global retire'
          bat 'retire --exitwith 0'

          step([$class: 'WarningsPublisher', canComputeNew: false, canResolveRelativePaths: false, consoleParsers: [[parserName: 'Node Security Project Vulnerabilities'], [parserName: 'RetireJS']], defaultEncoding: '', excludePattern: '', healthy: '', includePattern: '', messagesPattern: '', unHealthy: ''])
        } // stage

        stage('Publish') {
          if (isMaster) {
            bat 'npm publish'
            // tag in git if npm publish worked
            pushGitTag(name: packageVersion, message: "See ${env.BUILD_URL} for more information.", force: true)

            updateJIRA('TIMOB', "windowslib ${packageVersion}", scm)
          }
        } // stage
      } // ansiColor
    } //nodejs
  } // node
} // timestamps
