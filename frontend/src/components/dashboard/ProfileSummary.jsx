import { Link } from "react-router-dom";

function ProfileSummary({ profile = {} }) {
  const completion = profile.completion || 0;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Profile Summary</h2>

        <Link
          to="/profile"
          className="text-blue-600 hover:underline text-sm"
        >
          Edit Profile
        </Link>
      </div>

      <div className="mb-5">
        <div className="flex justify-between mb-2">
          <span>Profile Completion</span>
          <span>{completion}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-semibold">Career Goal:</span>{" "}
          {profile.careerGoal || "Not specified"}
        </div>

        <div>
          <span className="font-semibold">Skills:</span>{" "}
          {profile.skills?.length || 0}
        </div>

        <div>
          <span className="font-semibold">Resume:</span>{" "}
          {profile.resumeUploaded ? "Uploaded" : "Not Uploaded"}
        </div>

        <div>
          <span className="font-semibold">LinkedIn:</span>{" "}
          {profile.linkedinUrl ? "Added" : "Not Added"}
        </div>
      </div>
    </div>
  );
}

export default ProfileSummary;