import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl'; 
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string; // Change from Svg component to image path string
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Structured Documentation',
    image: '/img/mountain_minecraft.png', // Path from static folder
    description: (
      <>
        All documentation and code follow clear, common rules and structure. Find what you need quickly and understand it, no matter the project scope.
      </>
    ),
  },
  {
    title: 'My code Portfolio',
    image: '/img/computer_minecraft.png',
    description: (
      <>
        Get complementary insights to the ones on my main portfolio.
        Dive deep into the details and technical requirements for projects in Python, Node.js, and MySQL.
      </>
    ),
  },
  {
    title: 'Crafted from Scratch',
    image: '/img/working_minecraft.png',
    description: (
      <>
        This site is created with Docusaurus, using react to house my technical specs. It showcases my stack including HTML, CSS, Javascript, and more.
      </>
    ),
  },
];

function Feature({title, image, description}: FeatureItem) {
  const imageUrl = useBaseUrl(image); // Get the correct URL with base path
  
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img 
          src={imageUrl} 
          className={styles.featureSvg} // You can keep this class or rename it
          alt={title} 
        />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}