<?php

require_once 'mysql.php';

if (isset($_GET['f'])) {

    connection();

    if ($_GET['f'] == 1) {
        echo getGroups();
    }

    if ($_GET['f'] == 2) {
        echo newGroup($_POST['name']);
    }

    if ($_GET['f'] == 3) {
        echo getBlocks($_POST['id']);
    }

    if ($_GET['f'] == 4) {
        echo newBlock($_POST['durchmesser'], $_POST['laenge'], $_POST['type'], $_POST['groupId'], $_POST['rinde']);
    }

    if ($_GET['f'] == 5) {
        echo getTypes($_POST['id']);
    }

    if ($_GET['f'] == 6) {
        echo deleteBlock($_POST['id']);
    }

    if ($_GET['f'] == 7) {
        echo getSumme($_POST['id']);
    }

    if ($_GET['f'] == 8) {
        echo generatePrice($_POST['groupId'], json_decode($_POST['priceList']));
    }

    if ($_GET['f'] == 9) {
        echo changeBlock($_POST['id'], $_POST['durchmesser'], $_POST['laenge'], $_POST['type'], $_POST['rinde']);
    }
}

function getGroups() {
    $sql = "SELECT * FROM groups";
    $result = mysql_query($sql);
    $groups = array();
    while ($row = mysql_fetch_array($result)) {
        $group['id'] = $row['id'];
        $group['name'] = $row['name'];
        $groups[] = $group;
    }
    return json_encode($groups);
}

function newGroup($name) {
    $sql = "INSERT INTO groups (name) VALUES ('" . $name . "')";
    return mysql_query($sql);
}

function getBlocks($groupId) {
    $sql = "SELECT * FROM block where groupid = " . $groupId;
    $result = mysql_query($sql);
    $blocks = array();
    while ($row = mysql_fetch_array($result)) {
        $block['id'] = $row['id'];
        $block['durchmesser'] = zahlformat($row['durchmesser'], 2);
        $block['laenge'] = zahlformat($row['laenge'], 2);
        $block['type'] = getNameForType($row['type']);
        $block['volumen'] = zahlformat((pow($block['durchmesser'] / 2, 2) * pi() * $block['laenge'] * getRindeForType($row['type'], $row['rinde'])) / 1000000, 3);
        $block['rinde'] = getRindeName($row['rinde']);
        $blocks[] = $block;
    }

    return json_encode(array('blocks' => $blocks));
}

function getTypes($groupId) {
    $sql = "SELECT * FROM type";
    $result = mysql_query($sql);
    $types = array();
    while ($row = mysql_fetch_array($result)) {
        $type['id'] = $row['id'];
        $type['name'] = $row['name'];
        $type['rinde'] = $row['rinde'];
        $types[] = $type;
    }
    return json_encode(array('types' => $types));
}

function newBlock($durchmesser, $laenge, $type, $groupId, $rinde) {
    $sql = "INSERT INTO block (durchmesser, laenge, type, groupid, rinde) VALUES ('" . $durchmesser . "','" . $laenge . "','" . $type . "'," . $groupId . ",'" . $rinde . "')";
    return mysql_query($sql);
}

function deleteBlock($id) {
    $sql = "DELETE FROM block where id = " . $id;
    return mysql_query($sql);
}

function getSumme($id) {
    $sql = "SELECT type.*,price.price FROM type LEFT JOIN price ON type.id = price.type and price.groupid = " . $id;
    $result = mysql_query($sql);
    $typSummen = array();
    $total = 0;
    $totalPrice = 0;
    while ($row = mysql_fetch_array($result)) {
        $type['name'] = $row['name'];
        $type['id'] = $row['id'];
        $type['price'] = isset($row['price']) ? zahlformat($row['price'], 2) : zahlformat(0, 2);
        $sql = "SELECT * FROM block where type = " . $row['id'] . " AND groupid = " . $id;
        $result2 = mysql_query($sql);
        $summe = 0;
        while ($row2 = mysql_fetch_array($result2)) {
            $summe += (pow($row2['durchmesser'] / 2, 2) * pi() * $row2['laenge'] * getRindeForType($row2['type'], $row2['rinde'])) / 1000000;
        }
        if ($summe == 0) {
            continue;
        }
        $type['summe'] = zahlformat($summe, 3);
        $type['summePrice'] = zahlformat($summe * $type['price'], 2);
        $total += $summe;
        $totalPrice += $summe * $type['price'];
        $typSummen[] = $type;
    }
    return json_encode(array('types' => $typSummen, 'total' => zahlformat($total, 3), 'totalPrice' => zahlformat($totalPrice, 2)));
}

function changeBlock($id, $durchmesser, $laenge, $type, $rinde) {
    $sql = "UPDATE block SET durchmesser = '$durchmesser', laenge = '$laenge', type = '$type', rinde = '$rinde' where id = $id";
    return mysql_query($sql);
}

function generatePrice($groupId, $priceList) {
    foreach ($priceList as $elem) {
        $elem = json_decode($elem);
        mysql_query('DELETE from price where groupid = ' . $groupId . ' AND type = ' . $elem->id);
        $sql = 'INSERT INTO price (type,groupid,price) VALUES (' . $elem->id . ',' . $groupId . ',"' . $elem->price . '")';
        mysql_query($sql);
    }
    return 1;
}

function getRindeForType($id, $rinde) {
    if ($rinde == 1) {
        $sql = "SELECT rinde FROM type where id = " . $id;
        $result = mysql_query($sql);
        while ($row = mysql_fetch_array($result)) {
            return 1 - ($row['rinde'] / 100);
        }
    } else {
        return 1;
    }
}

function getNameForType($id) {
    $sql = "SELECT name FROM type where id = " . $id;
    $result = mysql_query($sql);
    while ($row = mysql_fetch_array($result)) {
        return $row['name'];
    }
}

function zahlformat($zahl, $komma) {
    return number_format($zahl, $komma, ',', '.');
}

function getRindeName($rinde) {
    if ($rinde == 1) {
        return 'Ja';
    } else {
        return 'Nein';
    }
}

?>
