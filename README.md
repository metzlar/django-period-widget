django-period-widget
====================

Use an HTML5 range input as widget for a datetime value to
specify a datetime range together with another start datetime.

Install
-------

`pip install -e git+/path/to/github/django-period-widget#egg=django_period_widget`

Add `django_period_widget` to `INSTALLED_APPS`

Run `python manage.py collectstatic`

Usage
-----

Create a form:

    from django.contrib.admin.widgets import AdminSplitDateTime
	from django_period_widget import forms as djpforms

	class MyForm(forms.Form):

	start_date = forms.DateTimeField(
       	widget=AdminSplitDateTime(attrs={
	        'class': 'dj-period-start'}))

	end_date = forms.DateTimeField(
	    verbose_name = _('Duration'),
			widget=djpforms.PeriodWidget(attrs={
				'period-start': 'input.dj-period-start'}))


Use a `ModelForm`:

	class MyModelForm(forms.ModelForm):
	    def __init__(self, *args, **kwargs):
	        super(MyModelForm, self).__init__(*args, **kwargs)

	        self.fields[
				'start_date'
			].widget = widgets.AdminSplitDateTime(attrs={
            	'class': 'dj-period-start'
			})

	        self.fields[
				'end_date'
            ].widget = djpforms.PeriodWidget(attrs={
	            'period-start': 'input.dj-period-start'}))


TODO
----

* Support multiple units, currently only minutes are supported
* More flexibility to support more use cases
