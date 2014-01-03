from django import forms


class PeriodWidget(forms.HiddenInput):
    def __init__(self, *args, **kwargs):
        attrs = kwargs.pop('attrs', {})

        if 'class' in attrs:
            attrs['class'] = attrs['class'] + ' dj-period'
        else:
            attrs['class'] = 'dj-period'
            
        super(PeriodWidget, self).__init__(
            attrs=attrs, *args, **kwargs)
        
    class Media:
        js = (
            'django_period_widget/js/period.js',
        )