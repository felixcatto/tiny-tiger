import { Form, Formik } from 'formik';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../common/layout.js';
import {
  ErrorMessage,
  Field,
  getUrl,
  persistUser,
  SubmitBtn,
  useContext,
  useSubmit,
  WithApiErrors,
} from '../lib/utils.js';

const Login = () => {
  const { actions } = useContext();
  const navigate = useNavigate();
  const onSubmit = useSubmit(async values => {
    const user = await actions.signIn(values);
    persistUser(user);
    navigate(getUrl('home'));
  });

  return (
    <Layout>
      <div className="row">
        <div className="col-4">
          <Formik initialValues={{ email: '', password: '' }} onSubmit={onSubmit}>
            <Form>
              <div className="mb-4">
                <label className="text-sm">Email</label>
                <Field className="input" name="email" />
                <ErrorMessage name="email" />
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
