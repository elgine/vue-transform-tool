module.exports = (DEBUG, ELECTRON, title = '', html = '', innerScript = '', scriptTags = '', linkTags = '', styleTags = '') => {
    console.log('debug: ', DEBUG, ', electron: ', ELECTRON);
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>${title}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <meta name="referrer" content="no-referrer"/>     
            <style>
                html, body, #app{
                    padding: 0;
                    margin: 0;
                    width: 100%;
                    height: 100%;
                }
                #app{
                    position: relative;
                }
            </style>  
            ${linkTags}
            ${styleTags}
            <script>
                window.__DEBUG__ = ${DEBUG};
                window.__ELECTRON__ = ${ELECTRON};
                ${innerScript}
            </script>
        </head>
        <body>
            <div id="app">${html}</div>
        </body>
        ${scriptTags}
        </html>
    `;
};