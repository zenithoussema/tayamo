import { Award, Building2, ClipboardList } from "lucide-react";

interface FeaturesProps {
  dictionary: Record<string, Record<string, string>>;
}

export function Features({ dictionary }: FeaturesProps) {
  const home = dictionary.home;

  const features = [
    {
      title: home.feature_1_title,
      desc: home.feature_1_desc,
      icon: <Award className="h-12 w-12" />,
    },
    {
      title: home.feature_2_title,
      desc: home.feature_2_desc,
      icon: <Building2 className="h-12 w-12" />,
    },
    {
      title: home.feature_3_title,
      desc: home.feature_3_desc,
      icon: <ClipboardList className="h-12 w-12" />,
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2
          className="mb-12 text-center text-4xl font-extrabold text-primary-dark"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {home.features_title}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-xl bg-bg p-8 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-accent">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-primary-dark">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
