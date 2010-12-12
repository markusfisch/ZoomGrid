/*
 *   O         ,-
 *  ° o    . -´  '     ,-
 *   °  .´        ` . ´,´
 *     ( °   ))     . (
 *      `-;_    . -´ `.`.
 *          `._'       ´
 *
 * Copyright (c) 2010 Markus Fisch <mf@markusfisch.de>
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

/**
 * Duration (in ms) after which to fade out when inactive
 *
 * @access protected
 * @var integer
 */
ZoomGrid.prototype.fadeOutAfter = 1000;

/**
 * Timeout for fade in/out
 *
 * @access protected
 * @var integer
 */
ZoomGrid.prototype.fadingTimeout = 10;

/**
 * Current opacity of zoom grid container
 *
 * @access protected
 * @var float
 */
ZoomGrid.prototype.containerOpacity = 1;

/**
 * Save existing onMouseMove handler
 *
 * @access protected
 * @var function
 */
ZoomGrid.prototype.saveOnMouseMove = null;

/**
 * Timer id for fade in
 *
 * @access protected
 * @var integer
 */
ZoomGrid.prototype.fadeInTimer = 0;

/**
 * Timer id for fade out
 *
 * @access protected
 * @var integer
 */
ZoomGrid.prototype.fadeOutTimer = 0;

/**
 * Add fade out/in effect of container on inactivity
 *
 * @access public
 * @param p - parent element to add onMouseMove listener (optional)
 * @return true on success, false otherwise
 */
ZoomGrid.prototype.addContainerFade = function( p )
{
	// check if instance has transparency extension
	if( !this.opacityFocused )
		return false;

	if( !p )
		p = document;

	if( !p.zoomGrid )
		p.zoomGrid = { zoomGrid: this };

	this.saveOnMouseMove = p.onmousemove;
	p.onmousemove = this.mouseMove;

	return true;
}

/**
 * Mouse move
 *
 * @access public
 * @param e - event
 */
ZoomGrid.prototype.mouseMove = function( e )
{
	var z;

	if( !this.zoomGrid ||
		!(z = this.zoomGrid.zoomGrid) )
		return;

	if( z.fadeOutTimer )
	{
		clearTimeout( z.fadeOutTimer );
		z.fadeOutTimer = 0;
	}

	if( z.containerOpacity < 1 )
	{
		z.fadeIn();
		return;
	}

	z.fadeOutTimer = setTimeout(
		function(){ z.fadeOut(); },
		z.fadeOutAfter );

	if( z.saveOnMouseMove )
		return z.saveOnMouseMove();
}

/**
 * Fade in
 *
 * @access public
 */
ZoomGrid.prototype.fadeIn = function()
{
	if( (this.containerOpacity += .25) > 1 )
		this.containerOpacity = 1;

	this.setOpacity(
		this.container,
		this.containerOpacity );

	if( this.containerOpacity == 1 )
		return;

	var t = this;
	this.fadeInTimer = setTimeout(
		function(){ t.fadeIn(); },
		this.fadingTimeout );
}

/**
 * Fade out
 *
 * @access public
 */
ZoomGrid.prototype.fadeOut = function()
{
	if( (this.containerOpacity -= .25) < 0 )
		this.containerOpacity = 0;

	if( this.active ||
		this.moveTimer > 0 )
		this.containerOpacity = 1;

	this.setOpacity(
		this.container,
		this.containerOpacity );

	if( this.active > 0 ||
		this.containerOpacity == 0 )
		return;

	var t = this;
	this.fadeOutTimer = setTimeout(
		function(){ t.fadeOut(); },
		this.moveTimer > 0 ?
			this.fadeOutAfter :
			this.fadingTimeout );
}
