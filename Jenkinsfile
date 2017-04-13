library 'pipeline-library'

timestamps {
  node('windows && windows-sdk-10 && windows-sdk-8.1 && (vs2015 || vs2017)') {
    def packageVersion = ''
    def isPR = false
    stage('Checkout') {
      checkout scm

      isPR = env.BRANCH_NAME.startsWith('PR-')
      packageVersion = jsonParse(readFile('package.json'))['version']
      currentBuild.displayName = "#${packageVersion}-${currentBuild.number}"
    }

    nodejs(nodeJSInstallationName: 'node 4.7.3') {
      ansiColor('xterm') {
        timeout(10) {
          stage('Build') {
            bat 'npm install'
            // Try to kill any running emulators first?
            bat returnStatus: true, script: 'taskkill /IM xde.exe'
            // And stop them too!
            bat returnStatus: true, script: 'powershell -NoLogo -ExecutionPolicy ByPass -Command "& {Stop-VM *}"'
            withEnv(['JUNIT_REPORT_PATH=junit_report.xml']) {
              bat 'npm test'
            }
            junit 'junit_report.xml'
            fingerprint 'package.json'
            // Don't tag PRs
            if (!isPR) {
              pushGitTag(name: packageVersion, message: "See ${env.BUILD_URL} for more information.", force: true)
            }
          } // stage
        } // timeout

        stage('Security') {
          // Clean up and install only production dependencies
          bat 'rm -rf node_modules/'
          bat 'npm install --production'

          // Scan for NSP and RetireJS warnings
          bat 'npm install nsp'
          bat 'node ./node_modules/.bin/nsp check --output summary --warn-only'
          bat 'npm uninstall nsp'
          bat 'npm prune'

          bat 'npm install retire'
          bat 'node ./node_modules/.bin/retire --exitwith 0'
          bat 'npm uninstall retire'
          bat 'npm prune'

          step([$class: 'WarningsPublisher', canComputeNew: false, canResolveRelativePaths: false, consoleParsers: [[parserName: 'Node Security Project Vulnerabilities'], [parserName: 'RetireJS']], defaultEncoding: '', excludePattern: '', healthy: '', includePattern: '', messagesPattern: '', unHealthy: ''])
        } // stage
        // TODO Update JIRA?
      } // ansiColor
    } //nodejs
  } // node
} // timestamps
