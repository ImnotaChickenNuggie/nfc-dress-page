import Lanyard from './Lanyard';

export default function LanyardInfo(props) {
  return (
    <Lanyard
      {...props}
      frontImage="/etiqueta.png"
      imageFit="cover"
    />
  );
}
