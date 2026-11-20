export const Login = () => {
    const mount = document.getElementById('cms-app');
    const error = mount?.dataset.error ?? '';
    const lastUsername = mount?.dataset.lastUsername ?? '';
    const csrfToken = mount?.dataset.csrfToken ?? '';
    const loginCheck = mount?.dataset.loginCheck || '/manage/login_check';

    return (
        <main className="login-box">
            <div className="card card-outline card-primary">
                <div className="card-header">
                    <h1 className="mb-0 text-center"><b>Evil</b> Wife</h1>
                </div>
                <div className="card-body login-card-body">
                    {error ? <div className="alert alert-danger">{error}</div> : null}

                    <form action={loginCheck} method="post">
                        <input type="hidden" name="_csrf_token" value={csrfToken} />
                        <div className="input-group mb-1">
                            <div className="form-floating">
                                <input id="loginUsername" type="text" name="_username" className="form-control" placeholder="" defaultValue={lastUsername} autoComplete="username" />
                                <label htmlFor="loginUsername">Username</label>
                            </div>
                            <div className="input-group-text">
                                <span className="bi bi-person"></span>
                            </div>
                        </div>
                        <div className="input-group mb-1">
                            <div className="form-floating">
                                <input id="loginPassword" type="password" name="_password" className="form-control" placeholder="" autoComplete="current-password" />
                                <label htmlFor="loginPassword">Password</label>
                            </div>
                            <div className="input-group-text">
                                <span className="bi bi-lock-fill"></span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-8 d-inline-flex align-items-center">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" name="_remember_me" value="on" id="loginRemember" />
                                    <label className="form-check-label" htmlFor="loginRemember">Remember Me</label>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">Sign In</button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <p className="mt-3">
                        <a href="#">I forgot my password</a>
                    </p>
                </div>
            </div>
        </main>
    );
};
