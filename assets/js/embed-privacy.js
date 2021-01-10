/**
 * Embed Privacy JavaScript functions.
 * 
 * @author		Epiphyt
 * @license		GPL2
 * @package		epiphyt\Embed_Privacy
 */
document.addEventListener( 'DOMContentLoaded', function() {
	var overlays = document.querySelectorAll( '.embed-privacy-overlay' );
	var labels = document.querySelectorAll( '.embed-privacy-inner .embed-privacy-label' );
	
	for ( var i = 0; i < overlays.length; i++ ) {
		overlays[ i ].addEventListener( 'click', function( event ) {
			overlayClick( event.currentTarget );
		} );
	}
	
	if ( embedPrivacy.javascriptDetection === 'yes' ) {
		enableAlwaysActiveProviders();
	}
	
	for ( var i = 0; i < labels.length; i++ ) {
		labels[ i ].addEventListener( 'click', function( event ) {
			// don't trigger the overlays click
			event.stopPropagation();
			
			var current_target = event.currentTarget;
			var checkbox_id = current_target.getAttribute( 'for' );
			var embed_provider = current_target.getAttribute( 'data-embed-provider' );
			var cookie = ( get_cookie( 'embed-privacy' ) ? JSON.parse( get_cookie( 'embed-privacy' ) ) : '' );
			
			if ( document.getElementById( checkbox_id ).checked ) {
				// add|update the cookie's value
				if ( cookie !== null && Object.keys( cookie ).length !== 0 && cookie.constructor === Object ) {
					cookie[ embed_provider ] = true;
					
					set_cookie( 'embed-privacy', JSON.stringify( cookie ) );
				}
				else {
					set_cookie( 'embed-privacy', '{"' + embed_provider + '":true}', 365 );
				}
			}
			else if ( cookie !== null ) {
				delete cookie[ embed_provider ];
				
				if ( Object.keys( cookie ).length !== 0 ) {
					set_cookie( 'embed-privacy', JSON.stringify( cookie ), 365 );
				}
				else {
					remove_cookie( 'embed-privacy' );
				}
			}
		} );
	}
	
	/**
	 * Check whether to enable an always active provider by default.
	 * 
	 * @since	1.2.0
	 */
	function enableAlwaysActiveProviders() {
		var cookie = ( get_cookie( 'embed-privacy' ) ? JSON.parse( get_cookie( 'embed-privacy' ) ) : '' );
		
		if ( cookie === null || ! Object.keys( cookie ).length ) {
			return;
		}
		
		var providers = Object.keys( cookie );
		
		for ( var i = 0; i < overlays.length; i++ ) {
			var provider = overlays[ i ].parentNode.getAttribute( 'data-embed-provider' );
			
			if ( providers.includes( provider ) ) {
				overlays[ i ].click();
			}
		}
	}
	
	/**
	 * Clicking on an overlay.
	 * 
	 * @since	1.2.0
	 * 
	 * @param	{element}	target Target element
	 */
	function overlayClick( target ) {
		var embedContent = target.nextElementSibling;
		
		// hide the embed overlay
		target.style.display = 'none';
		// get stored content from JavaScript
		var embedObject = JSON.parse( window[ '_' + target.parentNode.id ] );
		
		embedContent.innerHTML = htmlentities_decode( embedObject.embed );
		
		// get all script tags inside the embed
		var scriptTags = embedContent.querySelectorAll( 'script' );
		
		// insert every script tag inside the embed as a new script
		// to execute it
		for ( var n = 0; n < scriptTags.length; n++ ) {
			var element = document.createElement( 'script' );
			
			if ( scriptTags[ n ].src ) {
				// if script tag has a src attribute
				element.src = scriptTags[ n ].src;
			}
			else {
				// if script tag has content
				element.innerHTML = scriptTags[ n ].innerHTML;
			}
			
			// append it to body
			embedContent.appendChild( element );
		}
	}
} );

/**
 * Get a cookie
 * 
 * @link	https://stackoverflow.com/a/24103596/3461955
 * 
 * @param	{String}		name The name of the cookie
 */
function get_cookie( name ) {
	var nameEQ = name + '=';
	var ca = document.cookie.split( ';' );
	for ( var i = 0; i < ca.length; i++ ) {
		var c = ca[ i ];
		while ( c.charAt( 0 ) == ' ' ) c = c.substring( 1, c.length );
		if ( c.indexOf( nameEQ ) == 0 ) return c.substring( nameEQ.length, c.length );
	}
	return null;
}

/**
 * Decode a string with HTML entities.
 * 
 * @param	{string}		content The content to decode
 * @return	{string} The decoded content
 */
function htmlentities_decode( content ) {
	var textarea = document.createElement( 'textarea' );
	
	textarea.innerHTML = content;
	
	return textarea.value;
}

/**
 * Remove a cookie
 * 
 * @link	https://stackoverflow.com/a/24103596/3461955
 * 
 * @param	{String}		name The name of the cookie
 */
function remove_cookie( name ) {
	document.cookie = name + '=; expires=0; path=/';
}

/**
 * Set a cookie
 * 
 * @link	https://stackoverflow.com/a/24103596/3461955
 * 
 * @param	{String}		name The name of the cookie
 * @param	{String}		value The value of the cookie
 * @param	{Number}		days The expiration in days
 */
function set_cookie( name, value, days ) {
	var expires = '';
	if ( days ) {
		var date = new Date();
		date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
		expires = '; expires=' + date.toUTCString();
	}
	document.cookie = name + '=' + ( value || '' ) + expires + '; path=/';
}
