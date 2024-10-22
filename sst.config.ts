// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'astrowind',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    new sst.aws.StaticSite('AstrowindTemplate', {
      build: {
        command: 'npm run build',
        output: 'dist',
      },
      edge: {
        viewerRequest: {
          injection: `
            var request = event.request;
            var uri = request.uri;
            
            var params = '';
            if(('querystring' in request) && (request.querystring.length > 0)) {
                params = '?'+request.querystring;
            }
            
            if(uri.endsWith('/')) {
                if(uri !== '/') {
                    var response = {
                        statusCode: 301,
                        statusDescription: 'Permanently moved',
                        headers:
                        { "location": { "value": \`\${uri.slice(0, -1) + params}\` } } // remove trailing slash
                    }
            
                    return response;    
                }

            }
            //Check whether the URI is missing a file extension.
            else if (!uri.includes('.')) {
                request.uri += '/index.html';
            }`,
        },
      },
    });
  },
});
