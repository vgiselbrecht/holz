var content;
$(document).ready(function () {  
    content = $('#content');
    loadGroups();
    $('a.buttonDia').click(function () {       
        $('#dialog-overlay, #dialog-box').hide();         
        return false;  
    });  
    $(window).resize(function () {  
        if (!$('#dialog-box').is(':hidden')) popup();         
    });
});

function loadGroups()
{
    $.getJSON('ajax.php?f=1', function(result) {
        var print = '<div id="newGroup"><input id="groupName" type="test" placeholder="Gruppenname"><input type="submit" onclick="newGroup()" value="erstellen"></div>';
        if(result.length)
        {
            print += '<table cellspacing="0" cellpadding="4">';
            print += '<tr><th>Bezeichnung</th><th>Bearbeiten</th></tr>';
            for(var i = 0; i < result.length; i++)
            {
                var name = result[i]['name'];
                var id = result[i]['id'];
                print += '<tr><td>'+name+'</td><td><a class="link" onclick="showBlocks('+id+','+name+')">bearbeiten</a></td></tr>';
            }
            print += '</table>';
        }
        content.html(print);
        hideLoading();
    });
}

function newGroup()
{
    if($('#groupName').val() != '')
    {
        jQuery.ajax({
            url: "ajax.php?f=2",
            type: "POST",
            data: {
                name: $('#groupName').val()
            },
            dataType: "json",
            success: function(result) {
                loadGroups();
            }
        });
    }
}

function showBlocks(groupId,name)
{
    showLoading();
    content.html('<h2 class="onlyPrint">Gruppe: '+name+'</h2><div id="inputArea"></div><div id="listArea"></div><div id="sumArea"></div><input id="print" type="submit" value="Drucken" onclick="window.print();return false" class="noPrint"><br><a id="back" class="link" onclick="back()">Zurück</a>');
    
    jQuery.ajax({
        url: "ajax.php?f=5",
        type: "POST",
        data: {
            id: groupId
        },
        dataType: "json",
        success: function(result) {
            var print = '<form onsubmit="newBlock('+groupId+');return false;"><input id="laenge" type="test" placeholder="Länge">';
            print += '<input id="durchmesser" type="test" placeholder="Durchmesser">';
            print += selectTypeValue(result['types']);
            print += 'Rinde:<input id="rinde" type="checkbox" checked>';
            print += '<input type="submit" onclick="newBlock('+groupId+')" value="hinzufügen"></form>';
            $('#inputArea').html(print);
        }
    });
    bockList(groupId);
    hideLoading();
}

function bockList(groupId)
{
    jQuery.ajax({
        url: "ajax.php?f=3",
        type: "POST",
        data: {
            id: groupId
        },
        dataType: "json",
        success: function(result) {
            if(result['blocks'].length)
            {
                var print = '<table cellspacing="0" cellpadding="4">';
                print += '<tr><th>Länge</th><th>Durchmesser</th><th>Type</th><th>Volumen</th><th>Rinde</th><th class="noPrint">Löschen</th><th class="noPrint">Bearbeiten</th></tr>';
                for(var i = 0; i < result['blocks'].length; i++)
                {
                    var id = result['blocks'][i]['id'];
                    var laenge = result['blocks'][i]['laenge'];
                    var durchmesser = result['blocks'][i]['durchmesser'];
                    var volumen = result['blocks'][i]['volumen'];
                    var type = result['blocks'][i]['type'];
                    var rinde = result['blocks'][i]['rinde'];
                    print += '<tr><td>'+laenge+'</td><td>'+durchmesser+'</td><td>'+type+'</td><td>'+volumen+'</td><td>'+rinde+'</td><td class="noPrint"><a class="link" onclick="deleteBlock('+id+','+groupId+')">löschen</a></td><td class="noPrint"><a class="link" onclick="changeBlockDialog('+id+',\''+laenge+'\',\''+durchmesser+'\',\''+type+'\',\''+rinde+'\','+groupId+')">bearbeiten</a></td></tr>';
                }
                print += '</table>';
                $('#listArea').html(print);
            }
            
        }
    });
    
    jQuery.ajax({
        url: "ajax.php?f=7",
        type: "POST",
        data: {
            id: groupId
        },
        dataType: "json",
        success: function(result) {
            if(result['types'].length)
            {
                var print = '<table cellspacing="0" cellpadding="4">';
                print += '<tr><th>Type</th><th>Volumen</th><th>Preis</th><th>Summe</th></tr>';
                var count = 0;
                for(var i = 0; i < result['types'].length; i++)
                {
                    var name = result['types'][i]['name'];
                    var summe = result['types'][i]['summe'];
                    var id = result['types'][i]['id'];
                    var price = result['types'][i]['price'];
                    var summePrice = result['types'][i]['summePrice'];
                    print += '<tr><td>'+name+'</td><td>'+summe+'</td><td><input class="noPrint" id="price_'+count+'" type="text" size="7" value="'+price+'"><input id="id_'+count+'" value="'+id+'" type="hidden"><span class="onlyPrint right">'+price+'€</span></td><td class="right">'+summePrice+'€</td></tr>';
                    count++;
                }
                print += '<tr><td>Gesamt:</td><td>'+result['total']+'</td><td><input class="noPrint" onclick="generatePrice('+groupId+','+count+')" type="submit" value="berechnen"></td><td class="right">'+result['totalPrice']+'€</td></tr>';
                print += '</table>';
                $('#sumArea').html(print);
                hideLoading();
            }
            
        }
    });
}

function newBlock(groupId)
{
    if($('#rinde').is(':checked')){
        rinde = 1;
    }
    else
    {
        rinde = 0;
    }
    if($('#durchmesser').val() != '' && $('#laenge').val() != '')
    {
        jQuery.ajax({
            url: "ajax.php?f=4",
            type: "POST",
            data: {
                durchmesser: $('#durchmesser').val(),
                laenge: $('#laenge').val(),
                type: $('#type').val(),
                rinde: rinde,
                groupId: groupId
            },
            dataType: "json",
            success: function(result) {
                bockList(groupId);
            }
        });
    }
    $('#laenge').val('');
    $('#durchmesser').val('');
}

function selectTypeValue(types)
{
    var print = '<select id="type">';
    for(var i = 0; i < types.length; i++)
    {
        var name = types[i]['name'];
        var id = types[i]['id'];
        print += '<option value="'+id+'">'+name+'</option>';
    }
    print += '</select>';
    return print;
}

function selectTypeValue(types, type)
{
    if(type)
    {
        var print = '<select id="typec">';
    }
    else
    {
        var print = '<select id="type">';
    }
    for(var i = 0; i < types.length; i++)
    {
        var name = types[i]['name'];
        var id = types[i]['id'];
        var sel = '';
        if(type == name)
        {
            sel='selected';
        }
        print += '<option '+sel+' value="'+id+'">'+name+'</option>';
    }
    print += '</select>';
    return print;
}

function deleteBlock(id,groupId)
{
    if(confirm("Soll der Block wirklich gelöscht werden?") == true){
        jQuery.ajax({
            url: "ajax.php?f=6",
            type: "POST",
            data: {
                id: id
            },
            dataType: "json",
            success: function(result) {
                bockList(groupId);
            }
        });
    }
}

function generatePrice(groupId,count)
{
    showLoading();
    var priceList = new Array();
    for(var i = 0; i < count; i++)
    {
        var elem = {};
        elem["price"] = $('#price_'+i).val();
        elem["id"] = $('#id_'+i).val();
        priceList.push(JSON.stringify(elem));
    }
    jQuery.ajax({
        url: "ajax.php?f=8",
        type: "POST",
        data: {
            groupId: groupId,
            priceList: JSON.stringify(priceList)
        },
        dataType: "json",
        success: function(result) {
            bockList(groupId);
        }
    });
}

function back()
{
    showLoading();
    loadGroups();
}

function showLoading()
{
    $('#Dialog').fadeIn('slow');
}

function hideLoading()
{
    $('#Dialog').fadeOut('slow');
}

function changeBlockDialog(id, laenge, durchmesser, type, rinde, groupId)
{
    showLoading();
    jQuery.ajax({
        url: "ajax.php?f=5",
        type: "POST",
        data: {
            id: groupId
        },
        dataType: "json",
        success: function(result) {
            var rc;
            if (rinde == "Ja")
            {
                rc = 'checked';
            }
            var print = '<form onsubmit="changeBlock('+id+','+groupId+');return false;"><input id="laengec" type="text" value="'+laenge+'" placeholder="Länge">';
            print += '<input id="durchmesserc" type="text" value="'+durchmesser+'" placeholder="Durchmesser">';
            print += selectTypeValue(result['types'],type);
            print += 'Rinde:<input id="rindec" type="checkbox" '+rc+'>';
            print += '<input type="submit" onclick="changeBlock('+id+','+groupId+')" value="ändern"></fórm>';
            popup(print);
            $('#Dialog').fadeOut('fast');
        }
    });
}

function changeBlock(id,groupId)
{
    var rinde;
    if($('#rindec').is(':checked')){
        rinde = 1;
    }
    else
    {
        rinde = 0;
    }
    if($('#durchmesserc').val() != '' && $('#laengec').val() != '')
    {
        jQuery.ajax({
            url: "ajax.php?f=9",
            type: "POST",
            data: {
                durchmesser: $('#durchmesserc').val(),
                laenge: $('#laengec').val(),
                type: $('#typec').val(),
                rinde: rinde,
                id: id
            },
            dataType: "json",
            success: function(result) {
                bockList(groupId);
            }
        });
        $('#dialog-overlay, #dialog-box').hide();
    } 
}

//Popup dialog  
function popup(message) {  
          
    // get the screen height and width    
    var maskHeight = $(document).height();    
    var maskWidth = $(window).width();  
      
    // calculate the values for center alignment  
    if (maskHeight > $('#dialog-box').height())
    {
        var dialogTop =  (maskHeight - $('#dialog-box').height())/6;  
    }
    else
    {
        var dialogTop = 15;
    }
    var dialogLeft = (maskWidth/2) - ($('#dialog-box').width()/2);   
      
    // assign values to the overlay and dialog box  
    $('#dialog-overlay').css({
        height:maskHeight, 
        width:maskWidth
    }).show();  
    $('#dialog-box').css({
        top:dialogTop, 
        left:dialogLeft
    }).show();  
      
    // display the message  
    $('#dialog-message').html(message);  
              
}