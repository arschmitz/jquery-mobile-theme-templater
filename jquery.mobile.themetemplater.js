/*!
* jQuery Mobile Theme Templater
* http://uglymongrel.com.com
*
* Copyright 2014 Alexander Schmitz and other contributors
* Released under the MIT license.
* http://jquery.org/license
*
* http://api.uglymongrel.com.com/jquery-mobile-theme-templater
*/
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Consistent styling for native dates. Tapping opens a calender to select date.
//>>label: Theme Templater
//>>group: Tools
//>>excludeEnd("jqmBuildExclude");
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

	// AMD. Register as an anonymous module.
	define([
		"jquery",
		"jquery-ui/datepicker"
	], factory );
	} else {

	// Browser globals
	factory( jQuery );
	}
}(function( $ ) {
$.widget("uglymongrel.themetemplater",{
	options: {
		enhanced: false,
		templates: {}
	},
	_create: function() {
		this.dict = {};
		this.swatches = [];
		this.templates = {};
		this.templateElements = this.element.find( ".ui-theme-template" );
		if ( !this.options.enhanced ) {
			this._enhance();
		} else {
			this.input = this.element.find( ".ui-theme-input" );
			this.output = this.element.find( ".ui-theme-output" );
			this.min = this.element.find( ".ui-theme-min" );
		}
		var that = this;

		this.templateElements.each(function(){
			var template = that._parseCSS( $( this ).val() );

			that.templates[ $( this ).attr( "name" ) ] = {
				global: template.global,
				swatch: template.swatches[ template.names[ 0 ] ]
			};
		}).hide();
		this._on( this.input, {
			"change" : "_updateDictionary"
		});
		this._on( this.generateButton, {
			"click": "_updateCSS"
		});
	},
	_enhance: function() {
		var that = this;
		this.input = $( "<textarea>" ).addClass( "ui-theme-input" ).textinput();
		this.output = $( "<textarea>" ).addClass( "ui-theme-output" ).textinput();
		this.min = $( "<textarea>" ).addClass( "ui-theme-min" ).textinput();
		this.element.append( this.input.add( this.output ).add( this.min) );
		this.input.before( "<span>Input: </span>" ).add( this.input.prev() ).wrapAll( "<div>" ).parent().css({
			clear: "both"
		});
		this.output.before( "<span>Output: </span>" ).add( this.output.prev() ).wrapAll( "<div>" ).parent().css({
			width: "40%",
			display: "inline-block"
		});
		this.min.before( "<span>Minified: </span>" ).add( this.min.prev() ).wrapAll( "<div>" ).parent().css({
			width: "40%",
			display: "inline-block",
			"margin-left": "2em"
		});
		this.controlgroup = $( "<div>" );
		this.templateElements.each(function(){
			that.controlgroup.append( "<label>" + $( this ).attr( "name" ) + "<input type='checkbox' name='" + $( this ).attr( "name" ) + "'></label>" );
		});
		this.includeOriginal = $( "<label>Include Original<input type='checkbox'></label>" );
		this.generateButton = $( "<button class='ui-btn ui-corner-all ui-shadow ui-icon-action ui-btn-icon-left'>Generate Theme</button>" );
		this.controls = $("<div>").append( this.includeOriginal.add( this.generateButton ) ).controlgroup({ type: "horizontal" });
		this.controlgroup.controlgroup({ type: "horizontal" }).css( "float", "left" );
		this.element.prepend( this.controlgroup.add( this.controls.css({ "float": "right" }) ) );
	},
	_parseCSS: function( temp ){
		var template = {}, swatches, that = this;

		template.global = temp.split( /\/\* Swatches \*\// )[ 0 ];
		template.swatches = {};
		swatchBlock = temp.split( /\/\* Swatches \*\// )[ 1 ];
		swatches = swatchBlock.split( /\/\*\s[A-Z]\s*-*\*\//g );
		swatches.splice( 0, 1 );
		template.names = swatchBlock.match( /\/\*\s[A-Z]\s*-*\*\//g );
		$.each( swatches, function( index, val ){
			template.names[ index ] = template.names[ index ].replace( /[^A-Z]/g, "" ).toLowerCase();
			template.swatches[ template.names[ index ] ] = val;
		});
		return template;
	},
	_updateDictionary: function() {
		var that = this,
			css = this._parseCSS( this.input.val() );
			// Find all rules in the css
			rules = this.input.val().match( /([a-z0-9\s#,\.\(\)]*)(\/\*\{[a-z\-]*\}\*\/)/g );

		// Empty the swatches arrays and dict to remove anything from previous run
		this.swatches = css.swatches;
		this.dict = {};

		// Loop through the rules we found and add them all to the dictionary
		$.each( rules, function( index, val ){

			// Split the placeholder and the value
			var prop = val.substring( 1 ).split( "/" );

			// Push the entry to the dictionary
			that.dict[ "/" + prop[ 1 ] + "/" ] = prop[ 0 ].substring( -1 );
		});
	},
	_updateCSS: function(){
		this.input.hide();
		var that = this, css = "", swatch = "", output,
			activeNames = [],
			activeTemplates = this.controlgroup.find( "input:checked" ).each(function(){
				activeNames.push( $( this ).attr( "name" ) );
			});


		if ( activeNames.length > 0 ) {
			$.each( activeNames, function( index, val ){
				css += that.templates[ val ].global;
				swatch += that.templates[ val ].swatch;
			});
			$.each( this.swatches, function( index, val ){
				css += that._replaceSwatchLetter( swatch, "a", index );
			});
			css = css.replace( /(\/\*\{[a-z\-]*\}\*\/)/g, function( match ){
				return that.dict[ match ] + match;
			});
			console.log( this.includeOriginal )
			css = this.includeOriginal.next().is( ":checked" ) ? this.input.val() + css : css
			this.output.val( css );
			$.post( "/min.php" , { input: css }, function( data ){
				that.min.val( data );
				that.output.add( that.min ).trigger( "change" );
			});
		}
	},
	_replaceSwatchLetter: function( css, fromLetter, toLetter ){
		return ( css
		.replace( ( new RegExp( "-" + fromLetter + ",", "g" ) ), "-" + toLetter + "," )
		.replace( ( new RegExp( "-" + fromLetter + "\\:", "g" ) ), "-" + toLetter + ":" )
		.replace( ( new RegExp( "-" + fromLetter + "\\s", "g" ) ), "-" + toLetter + " " )
		.replace( ( new RegExp( "{" + fromLetter + "-", "g" ) ), "{" + toLetter + "-" )
		.replace( ( new RegExp( "-" + fromLetter + "\\.", "g" ) ), "-" + toLetter + "." )
		.replace( ( new RegExp( "/\\*\\s" + fromLetter.toUpperCase() ) ), "/* " + toLetter.toUpperCase() ) );
	}

});

return $.mobile.date;

}));