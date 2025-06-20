import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { checkAuth, loginWithGitHub } from "../../store/auth";


function GitHubCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
 

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("GitHub OAuth Error:", error);
      toast.error('Github Login Failed', {
        position: 'bottom-right',
      });
      return;
    }

    if (code) {
dispatch(loginWithGitHub(code)).then((res) => {
  if (res?.payload?.success) {
    toast.success("Login successful!", {
      position: 'bottom-right',
    });

    dispatch(checkAuth()).then(() => {
      navigate("/project");
    });

  } else {
    toast.error("Login failed", {
      position: 'bottom-right',
    });
    navigate("/login");
  }
});

    } else {
      console.warn("No code received from GitHub");
      toast.error("Authorization Failed", {
        position: 'bottom-right',
      });
      navigate("/login");
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen text-center p-6">
      <div>
        <h2 className="text-xl font-semibold">GitHub OAuth Callback</h2>
        <p className="text-gray-600 mt-2">
          Waiting for GitHub to return authorization code...
        </p>
      </div>
    </div>
  );
}

export default GitHubCallback;
