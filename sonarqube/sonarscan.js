const scanner = require('sonarqube-scanner');

scanner(
    {
        serverUrl: 'http://3.231.147.238:9000/',
        token: "sqp_c03822a05fb8341580b227678317197f3d5bd3db",
        options: {
            'sonar.projectName': 'foraker',
            'sonar.projectDescription': 'Here I can add a description of my project',
            'sonar.projectKey': 'foraker',
            'sonar.projectVersion': '0.0.1',
            'sonar.exclusions': '',
            'sonar.sourceEncoding': 'UTF-8',
            'sonar.login': 'sqp_c03822a05fb8341580b227678317197f3d5bd3db'
        }
    },
    () => process.exit()
)