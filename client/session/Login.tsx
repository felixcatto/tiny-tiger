import { Form, Formik } from 'formik';
import React from 'react';
import { Link, useLocation } from 'wouter';
import Layout from '../components/layout.js';
import {
  ErrorMessage,
  Field,
  getUrl,
  SubmitBtn,
  useContext,
  useSubmit,
  WithApiErrors,
} from '../lib/utils.js';

const Login = () => {
  const { actions } = useContext();
  const [_, navigate] = useLocation();
  const onSubmit = useSubmit(async values => {
    await actions.signIn(values);
    navigate(getUrl('home'));
  });

  return (
    <Layout>
      <div className="row">
        <div className="col-4">
          <Formik initialValues={{ name: '', password: '' }} onSubmit={onSubmit}>
            <Form>
              <div className="mb-4">
                <label className="text-sm">Login</label>
                <Field className="input" name="name" />
                <ErrorMessage name="name" />
              </div>
              <div className="mb-4">
                <label className="text-sm">Password</label>
                <Field className="input" name="password" type="password" />
                <ErrorMessage name="password" />
              </div>

              <div>
                <Link to={getUrl('home')} className="mr-3">
                  Cancel
                </Link>
                <SubmitBtn className="btn btn_primary">Sign in</SubmitBtn>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </Layout>
  );
};

export default WithApiErrors(Login);
