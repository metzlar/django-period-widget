(function(DjangoPeriod, $, undefined){

    if(window.DjangoPeriod == undefined)
	window.DjangoPeriod = DjangoPeriod;

    $.fn.reverse = [].reverse

    var inited = false;
    var nextId = 0;
    var options = {
	debug: false,
	query: 'input.dj-period-end',
	dataAttribute: 'period-start',
	inputTemplate: '<select />', //'<input type="range" />',
	className: 'dj-period',
	rangeStep: 5,
	rangeUnit: 'minutes',
	rangeDefault: 15,
	timezone: '-0800'
    };

    DjangoPeriod.init = function(opts){
	if(inited !== false) return;
	inited = true;

	options = $.extend(options, opts);

	DjangoPeriod.debug(
	    'Initing Period inputs for $("'+options.query+'")');

	$(function(){
	    var hiddenInputs = DjangoPeriod.filterParents(
		$(options.query));
	    DjangoPeriod.buildInput(hiddenInputs);
	});
    };

    DjangoPeriod.filterParents = function(query){
	/*  Remove all elements that share a parent with
	  * another element in `query` This is required
	  * to treat time & date fields as one single field.
	  */

	var result = $();

	query.reverse().each(function(){
	    var me = $(this);
	    if($.inArray(me.parent()[0], result.parent())){
		result = result.add(me);
	    }
	});
	return result;
    };

    DjangoPeriod.getIStart = function(obj){
	var self = $(obj);
	return $(self.attr(options.dataAttribute));
    };

    DjangoPeriod.getIEnd = function(obj){
	var self = $(obj);
	return $(options.query, self.parent()).not(self);
    };

    DjangoPeriod.findInFirstParent = function(qs, ctx){
	/* Search in the parent of ctx for qs
	 * If qs is not found, search in the parent of the
	 * parent. Continue searching in all subtrees of parents
	 * until no parent is left or qs is found.
	 */
	var parent = ctx.parent();
	if(!parent) return undefined;
	var test = $(qs, parent);
	if(test.length>0) return test;
	else return DjangoPeriod.findInFirstParent(qs, parent);
    };

    DjangoPeriod.getILabel = function(obj){
	var self = $(obj);
	return DjangoPeriod.findInFirstParent('label', self);
    };

    DjangoPeriod.getDateValue = function(obj){
	/* Utility function to create a Date instance
	 * from the list of input fields. Returns
	 * undefined if the Date cannot be created.
	 */

	var dt = $(obj[0]).val();
	var tm = $(obj[1]).val();

	if(tm.split(':').length==2){
	    tm += ':00';
	}

	var result = (dt + 'T' + tm + options.timezone);

	if(result==='T'){
	    return undefined;
	}

	result = new Date(Date.parse(result));

	if((''+result).indexOf('Invalid')!==-1){
	    return undefined;
	}

	return result;
    };

    DjangoPeriod.val2date = function(obj){
	/* Construct the date object 
	 * from self.val and update end_date fields.
	 */
	
	var self = $(obj);
	var startDate = DjangoPeriod.getDateValue(
	    DjangoPeriod.getIStart(self));
	if(startDate===undefined){
	    DjangoPeriod.debug('No start date');
	    return;
	}

	var _ = function(v){
	    if(v.length==1) v = '0' + v;
	    return v;
	};


	var end = DjangoPeriod.getIEnd(self);
	var myVal = self.val();
	var label = DjangoPeriod.getILabel(self);
	label.text(self.attr('title').replace('_#_', myVal));

	var endMilis = startDate.getTime() + (
	    parseInt(myVal)*60000);

	var endDate = new Date(endMilis);

	var month = _('' + ( 1 + endDate.getMonth()));
	var day = _('' + endDate.getDate());
	var year = '' + endDate.getFullYear();

	var endDt = year + '-' + month + '-' + day;

	var hours = _(''+endDate.getHours());
	var minutes = _(''+endDate.getMinutes());
	var milliseconds = _(''+endDate.getMilliseconds());

	var endTm = hours + ':' + minutes + ':' + milliseconds;

	if(end.length>1){
	    $(end[0]).val(endDt);
	    $(end[1]).val(endTm);
	} else {
	    end.val(endDt+' '+endTm);
	}

	DjangoPeriod.debug('startDate ='+startDate+'=');
	DjangoPeriod.debug('endDate ='+endDate+'=');
    };

    DjangoPeriod.date2val = function(obj){
	/* Using start_date and end_date fields,
	 * update self.value accordingly.
	 */
	var self = $(obj);

	var startDate = DjangoPeriod.getDateValue(
	    DjangoPeriod.getIStart(self));

	if(startDate===undefined){
	    self.val(options.rangeDefault);
	    self.trigger('change');
	    return;
	}

	var endDate = DjangoPeriod.getDateValue(
	    DjangoPeriod.getIEnd(self));

	DjangoPeriod.debug('startDate >'+startDate+'=');
	DjangoPeriod.debug('endDate >'+endDate+'=');
	
	if(endDate===undefined){
	    self.val(options.rangeDefault);
	    self.trigger('change');
	    return;
	}

	var milis = Math.abs(endDate - startDate);
	var self_val = (milis/1000)/60;
	//make sure self_val is a product of step
	self_val = Math.round(self_val / options.rangeStep);
	self_val = self_val * options.rangeStep;

	DjangoPeriod.debug('self_val', self_val);
	
	self.val(self_val);
    };

    DjangoPeriod.buildMinutesInput = function(obj){
	/* Add <option> tags to the <select> per
	 * minute options.rangeStep.
	 */
	var label = DjangoPeriod.getILabel(obj);
	for(var i=0; i<=60; i+=options.rangeStep){
	    obj.append($('<option value="'+(
		i)+'">'+(i)+' minutes</option>'));
	}
	obj.attr('title', label.text() + '(_#_ minutes)')
   };

    DjangoPeriod.buildInput = function(hiddenInput){
	/* Entry point function
         */

	var self = $(hiddenInput);

	if(!options.debug)
	    self.hide();
		
	DjangoPeriod.debug('Building Input', self);

	var i = $(options.inputTemplate).insertAfter(self);
	i.attr(
	    options.dataAttribute, 
	    self.attr(options.dataAttribute));
	i.addClass(options.className);

	if(options.rangeUnit==='minutes'){
	    DjangoPeriod.buildMinutesInput(i);
	}
	
	var handler = function(){DjangoPeriod.val2date(i)};

	i.change(handler);
	i.mousedown(handler);

	setTimeout(function(){
	    var start = DjangoPeriod.getIStart(i);
	    start.change(handler);

	    DjangoPeriod.date2val(i);
	    DjangoPeriod.val2date(i);
	}, 1000);
    };

    DjangoPeriod.debug = function(){
	/* Show a debug message.
	 */
	if(options.debug){
	    var message = (
		'[DjangoPeriod] DEBUG ' + Array.prototype.join.call(
		    arguments, ', '));

	    if(console===undefined||console.log===undefined){
		var log = $('.dj-period-log');
		if(log.length==0){
		    log = $(
			'<ul class="dj-period-log"></ul>'
		    ).appendTo('body');
		}
		log.prepend('<li>'+message+'</li>');
	    } else {
		console.log(message);
	    }
	}
    };

})(
    window.DjangoPeriod || {},
    window.jQuery
);

window.DjangoPeriod.init({debug:true});