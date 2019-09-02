<?php
namespace epiphyt\Embed_Privacy;
use function call_user_func_array;
use function func_get_args;
use function is_callable;
use function ob_get_clean;
use function ob_start;

/**
 * Filter the output of widgets.
 * 
 * @see		https://github.com/philipnewcomer/widget-output-filters
 * @since	1.1.0
 * @version	1.0.0
 */
class Embed_Privacy_Widget_Output_Filter {
	/**
	 * Contains the single instance of this class.
	 * 
	 * @var		Widget_Output_Filters
	 */
	private static $instance = null;
	
	/**
	 * Return the single instance of this class.
	 * 
	 * @return	Widget_Output_Filters The single instance of this class
	 */
	public static function get_instance() {
		if ( self::$instance === null ) {
			self::$instance = new self;
		}
		
		return self::$instance;
	}
	
	/**
	 * Initialize the functionality by registering actions and filters.
	 */
	private function __construct() {
		// priority of 9 to run before the Widget Logic plugin.
		add_filter( 'dynamic_sidebar_params', [ $this, 'filter_dynamic_sidebar_params', ], 9 );
	}
	
	/**
	 * Replace the widget's display callback with the Dynamic Sidebar Params display callback, storing the original callback for use later.
	 * The $sidebar_params variable is not modified; it is only used to get the current widget's ID.
	 * 
	 * @param	array	$sidebar_params The sidebar parameters
	 * @return	array The sidebar parameters
	 */
	public function filter_dynamic_sidebar_params( $sidebar_params ) {
		if ( is_admin() ) {
			return $sidebar_params;
		}
		
		global $wp_registered_widgets;
		$current_widget_id = $sidebar_params[0]['widget_id'];
		
		$wp_registered_widgets[ $current_widget_id ]['original_callback'] = $wp_registered_widgets[ $current_widget_id ]['callback'];
		$wp_registered_widgets[ $current_widget_id ]['callback'] = [ $this, 'display_widget' ];
		
		return $sidebar_params;
	}
	
	/**
	 * Execute the widget's original callback function, filtering its output.
	 */
	public function display_widget() {
		global $wp_registered_widgets;
		$original_callback_params = func_get_args();
		
		$widget_id = $original_callback_params[0]['widget_id'];
		$original_callback = $wp_registered_widgets[ $widget_id ]['original_callback'];
		
		$wp_registered_widgets[ $widget_id ]['callback'] = $original_callback;
		
		$widget_id_base = $original_callback[0]->id_base;
		$sidebar_id = $original_callback_params[0]['id'];
		
		if ( is_callable( $original_callback ) ) {
			
			ob_start();
			call_user_func_array( $original_callback, $original_callback_params );
			$widget_output = ob_get_clean();
			
			/**
			 * Filter the widget's output.
			 * 
			 * @param	string	$widget_output The widget's output
			 * @param	string	$widget_id_base The widget's base ID
			 * @param	string	$widget_id The widget's full ID
			 * @param	string	$sidebar_id The current sidebar ID
			 */
			echo apply_filters( 'embed_privacy_widget_output', $widget_output, $widget_id_base, $widget_id, $sidebar_id );
		}
	}
}
