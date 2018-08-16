using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Evolve
{
    class Gen
    {
        private const float MutatePower = 0.1f;

        private float _myMin = 0.5f;
        private float _myMax = 0.5f;
        private float _opponentMin = 0.5f;
        private float _opponentMax = 0.5f;

        public Boolean Processed = false;
        
        private String _tag = "";

        private static Random rnd = new Random();

        private ScoreData _score = new ScoreData();

        public Gen() {}

        public Gen(float myMin, float myMax, float oppMin, float oppMax) {
            _myMin = Math.Max(0, Math.Min(1, myMin));
            _myMax = Math.Max(0, Math.Min(1, myMax));
            _opponentMin = Math.Max(0, Math.Min(1, oppMin));
            _opponentMax = Math.Max(0, Math.Min(1, oppMax));
        }

        public Gen(XElement xml)
        {
            _myMin = float.Parse(xml.Attribute("MyMin").Value.Replace('.', ','));
            _myMax = float.Parse(xml.Attribute("MyMax").Value.Replace('.', ','));
            _opponentMin = float.Parse(xml.Attribute("OppMin").Value.Replace('.', ','));
            _opponentMax = float.Parse(xml.Attribute("OppMax").Value.Replace('.', ','));
        }

        public String ToJSON()
        {
            StringBuilder str = new StringBuilder();
            str.Append("{");
            str.Append("\"myMin\": ");
            str.Append(_myMin.ToString().Replace(',', '.'));
            str.Append(", ");
            str.Append("\"myMax\": ");
            str.Append(_myMax.ToString().Replace(',', '.'));
            str.Append(", ");
            str.Append("\"oppMin\": ");
            str.Append(_opponentMin.ToString().Replace(',', '.'));
            str.Append(", ");
            str.Append("\"oppMax\": ");
            str.Append(_opponentMax.ToString().Replace(',', '.'));
            str.Append("}");
            return str.ToString();
        }

        public XElement ToXML()
        {
            XElement xml = new XElement("gen");
            xml.Add(new XAttribute("MyMin", _myMin));
            xml.Add(new XAttribute("MyMax", _myMax));
            xml.Add(new XAttribute("OppMin", _opponentMin));
            xml.Add(new XAttribute("OppMax", _opponentMax));
            return xml;
        }

        public String Tag
        {
            get
            {
                return _tag;
            }
            set
            {
                _tag = value;
            }
        }

        public ScoreData Score
        {
            get
            {
                return _score;
            }
            set
            {
                _score = value;
            }
        }

        public Gen Mutate()
        {
            return new Gen(
                _myMin - MutatePower + (float)(rnd.NextDouble() * MutatePower * 2.0),
                _myMax - MutatePower + (float)(rnd.NextDouble() * MutatePower * 2.0),
                _opponentMin - MutatePower + (float)(rnd.NextDouble() * MutatePower * 2.0),
                _opponentMax - MutatePower + (float)(rnd.NextDouble() * MutatePower * 2.0));
        }
    }
}
