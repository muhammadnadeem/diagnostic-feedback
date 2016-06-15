"""Setup for diagnostic-feedback XBlock."""

import os
from setuptools import setup


def package_data(pkg, roots):
    """Generic function to find package_data.

    All of the files under each of the `roots` will be declared as package
    data for package `pkg`.

    """
    data = []
    for root in roots:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


setup(
    name='xblock-diagnostic-feedback',
    version='0.2.1',
    description='XBlock - Create quiz to generate diagnostic feedback',
    packages=[
        'diagnostic_feedback',
        'diagnostic_feedback.helpers',
        'diagnostic_feedback.tests',
        'diagnostic_feedback.validators'
    ],
    install_requires=[
        'XBlock',
    ],
    entry_points={
        'xblock.v1': [
            'diagnostic-feedback = diagnostic_feedback:QuizBlock',
        ]
    },
    package_data=package_data("diagnostic_feedback", ["templates", "static", "public"]),
)
