from setuptools import setup # pragma: no cover 

setup(
    name='Django Period Widget',
    py_modules=['django_period_widget',],
    cmdclass={'upload':lambda x:None},
    install_requires=[
        'django',
    ],
)# pragma: no cover 
 