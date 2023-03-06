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
  WithApiErrors,
} from '../lib/utils.js';

const Login = WithApiErrors(props => {
  const { actions } = useContext();
  const navigate = useNavigate();
  const { setApiErrors } = props;

  const onSubmit = async values => {
    try {
      const user = await actions.signIn(values);
      persistUser(user);
      navigate(getUrl('home'));
    } catch (e: any) {
      setApiErrors(e.errors);
    }
  };

  return (
    <Layout>
      <div className="row">
        <div className="col-4">
          <Formik initialValues={{ email: '', password: '' }} onSubmit={onSubmit}>
            <Form>
              <div className="mb-4">
                <label className="text-sm">Email</label>
                <Field className="form-control" name="email" />
                <ErrorMessage name="email" />
              </div>
              <div className="mb-4">
                <label className="text-sm">Password</label>
                <Field className="form-control" name="password" type="password" />
                <ErrorMessage name="password" />
              </div>

              <div>
                <Link to={getUrl('home')} className="mr-3">
                  Cancel
                </Link>
                <SubmitBtn className="btn">Sign in</SubmitBtn>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </Layout>
  );
});

export default Login;