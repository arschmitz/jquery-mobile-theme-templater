<?php
	$input = $_POST[ "input" ];
	$postdata = http_build_query(
	    array(
	        'input' => $input
	    )
	);
	$opts = array('http' =>
	    array(
		        'method'  => 'POST',
		        'header'  => 'Content-type: application/x-www-form-urlencoded',
		        'content' => $postdata
		    )
		);
	$context  = stream_context_create($opts);
	echo file_get_contents( "http://cssminifier.com/raw", false, $context );
?>