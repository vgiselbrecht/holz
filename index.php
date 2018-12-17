<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Holz</title>
        <link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="style.css" type="text/css"/>
        <link rel="stylesheet" type="text/css" href="print.css" media="print" />
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script> 
        <script src="script.js"></script> 
    </head>
    <body>
        <h1>Block Volumen Berechner</h1>
        <div id="content"></div>
        <div id="Dialog">
            <div id="DialogBackground"></div>
            <div id="DialogFront">
                <img src="images/loader.gif" class="loading" alt="loading"/>
                <div class="loadingText">
                    Daten werder geladen...
                </div>
            </div>
        </div>
        <div id="dialog-overlay"></div>  
        <div id="dialog-box">  
            <div class="dialog-content">  
                <div id="dialog-message"></div>  
                <a class="buttonDia link">Schließen</a>  
            </div>  
        </div>  
    </body>
</html>